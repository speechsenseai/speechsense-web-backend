import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Location } from './entities/location.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from '../device/entities/device.entity';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { CreateLocationDto } from './dto/CreateLocation.dto';
import { User } from '../users/entities/user.entity';
import { AwsS3Service } from '@/common/aws-s3/aws-s3.service';
import { RecordingService } from '../recording/recording.service';
import { DeviceService } from '../device/device.service';
import { RabbitMqService } from '@/common/rabbitmq/rabbitmq.service';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    private readonly awsS3Service: AwsS3Service,
    @Inject(forwardRef(() => RecordingService))
    private readonly recordingService: RecordingService,
    @Inject(forwardRef(() => DeviceService))
    private readonly deviceService: DeviceService,
    private readonly rabbitMqService: RabbitMqService,
  ) {}
  public async getLocations(userId: string, query: PaginateQuery) {
    return paginate(query, this.locationRepository, {
      sortableColumns: ['name', 'createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['name'],
      maxLimit: 10,
      defaultLimit: 10,

      where: {
        users: {
          id: userId,
        },
      },
    });
  }
  public async getOneLocation(user: User, locationId: string) {
    return this.locationRepository.findOne({
      where: {
        id: locationId,
        users: {
          id: user.id,
        },
      },
    });
  }
  public async createLocation(user: User, body: CreateLocationDto) {
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const location = this.locationRepository.create(body);
    location.users = [user];
    const savedLocation = await this.locationRepository.save(location);
    await this.createDeviceFolderS3({
      userUUID: user.id,
      location,
    });
    return savedLocation;
  }
  public async updateLocation(
    user: User,
    locationId: string,
    body: CreateLocationDto,
  ) {
    const location = await this.locationRepository.findOne({
      where: {
        id: locationId,
        users: {
          id: user.id,
        },
      },
    });
    if (!location) {
      throw new BadRequestException('Location not found');
    }
    Object.assign(location, body);
    return this.locationRepository.save(location);
  }

  public async deleteLocationWithS3(user: User, locationId: string) {
    const location = await this.locationRepository.findOne({
      where: {
        id: locationId,
        users: {
          id: user.id,
        },
      },
      relations: {
        devices: {
          recordings: true,
        },
      },
    });
    if (!location) {
      throw new BadRequestException('Location not found');
    }

    //Send messages to delete recordings
    await Promise.all(
      location.devices.flatMap(async (device) => {
        const bunch = await Promise.all(
          device.recordings.map(async (recording) => {
            return await this.rabbitMqService.sendMessage({
              body: JSON.stringify({
                record_id:
                  recording.metric_id ??
                  //It's temporary, record.metric_id is primary
                  recording.recordingS3Link
                    .split('/')
                    .pop()
                    ?.replace('.mp3', ''),
                record_tstamp: recording.createdAt,
                user_id: user.id,
                device_id: device.id,
                location_id: location.id,
                message_type: 'delete',
              }),
            });
          }),
        );
        return bunch;
      }),
    );

    //Delete recordings and location folder in s3
    const allRecordings = location.devices.flatMap((device) =>
      device.recordings.map((recording) => {
        return this.awsS3Service.getKeyFromUrl(recording.recordingS3Link);
      }),
    );
    const allDevices = location.devices.map(
      (device) => `/${user.id}/${location.id}/${device.id}/`,
    );
    await this.awsS3Service.deleteFiles([
      ...allRecordings,
      ...allDevices,
      `/${user.id}/${location.id}/`,
    ]);

    //Delete recordings in Database
    await Promise.all(
      location.devices.flatMap(async (device) => {
        const bunch = await Promise.all(
          device.recordings.map(async (recording) => {
            return this.recordingService.deleteRecordingWithoutDeletingInS3(
              user.id,
              recording.id,
            );
          }),
        );
        return bunch;
      }),
    );
    await Promise.all(
      location.devices.map(async (device) => {
        return this.deviceService.deleteDeviceWithoutDeletingInS3(
          user,
          device.id,
        );
      }),
    );
    // Remove the location from the user's locations
    await this.locationRepository
      .createQueryBuilder()
      .relation(User, 'locations')
      .of(user)
      .remove(location);

    // Delete the location
    await this.locationRepository.delete({ id: location.id });
    return 'Location deleted successfully';
  }

  public async createDefaultLocation(device: Device) {
    const location = this.locationRepository.create();
    location.name = 'My Default Location';
    location.description = 'This is the default location';
    location.devices = [device];
    return await this.locationRepository.save(location);
  }

  public async createDeviceFolderS3(options: {
    userUUID: string;
    location: Location;
  }) {
    const { userUUID, location } = options;
    try {
      return await this.awsS3Service.createFolder({
        path: `/${userUUID}/${location.id}/`,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      this.locationRepository.delete(location.id);
      throw new InternalServerErrorException(
        'Error creating folder s3',
        error?.name,
      );
    }
  }
}
