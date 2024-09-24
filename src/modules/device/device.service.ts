import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { FindOneOptions, Repository } from 'typeorm';
import { Device, DeviceType } from './entities/device.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { CreateDeviceDto } from './dto/CreateDevice.dto';
import { User } from '../users/entities/user.entity';
import { LocationService } from '../location/location.service';
import { AwsS3Service } from '@/common/aws-s3/aws-s3.service';
import { ConnectDeviceDto } from './dto/ConnectDevice.dto';
import { JwtService } from '@nestjs/jwt';
import { RecordingService } from '../recording/recording.service';
import { RabbitMqService } from '@/common/rabbitmq/rabbitmq.service';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @Inject(forwardRef(() => LocationService))
    private readonly locationService: LocationService,
    @Inject(forwardRef(() => RecordingService))
    private readonly recordingService: RecordingService,
    private readonly awsS3Service: AwsS3Service,
    private readonly jwtService: JwtService,
    private readonly rabbitMqService: RabbitMqService,
  ) {}
  //CRUD Services Start
  public async connectDevice(body: ConnectDeviceDto) {
    const token = await this.jwtService.signAsync(
      {
        uId: body.userId,
        lId: body.locationId,
        dId: body.deviceId,
        isDevice: true,
      },
      {
        secret: process.env.JWT_DEVICE_SECRET,
      },
    );
    return { token };
  }

  public async getOneDevice(userId: string, deviceId: string) {
    return this.deviceRepository.findOne({
      where: {
        id: deviceId,
        location: {
          users: {
            id: userId,
          },
        },
      },
    });
  }

  public async getDevicesByLocation(
    userId: string,
    locationId: string,
    query: PaginateQuery,
  ) {
    return paginate(query, this.deviceRepository, {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      maxLimit: 10,
      defaultLimit: 10,
      where: {
        location: {
          id: locationId,
          users: {
            id: userId,
          },
        },
      },
    });
  }

  public async updateDevice(
    user: User,
    deviceId: string,
    body: CreateDeviceDto,
  ) {
    const device = await this.deviceRepository.findOne({
      where: {
        id: deviceId,
        location: {
          users: {
            id: user.id,
          },
        },
      },
    });
    if (!device) {
      throw new BadRequestException('Device not found');
    }
    Object.assign(device, body);
    return this.deviceRepository.save(device);
  }

  public async createDevice(
    user: User,
    locationId: string,
    body: CreateDeviceDto,
  ) {
    const location = await this.locationService.getOneLocation(
      user,
      locationId,
    );
    if (!location) {
      throw new BadRequestException('Location not found');
    }
    const device = this.deviceRepository.create(body);

    device.location = location;
    const savedDevice = await this.deviceRepository.save(device);
    await this.createDeviceFolderS3({
      userUUID: user.id,
      locationId,
      device,
    });
    return savedDevice;
  }

  public async deleteDeviceWithS3(user: User, deviceId: string) {
    const device = await this.deviceRepository.findOne({
      where: {
        id: deviceId,
        location: {
          users: {
            id: user.id,
          },
        },
      },
      relations: {
        recordings: true,
        location: true,
      },
    });
    if (!device) {
      throw new BadRequestException('Device not found');
    }

    //Send messages to delete recordings
    await Promise.all(
      device.recordings.map(async (recording) => {
        return await this.rabbitMqService.sendMessage({
          body: JSON.stringify({
            record_id: recording.metric_id,
            record_tstamp: recording.createdAt,
            user_id: user.id,
            device_id: device.id,
            location_id: device.location.id,
            message_type: 'delete',
          }),
        });
      }),
    );

    //Delete recordings and device folder
    const allRecordings = device.recordings.map((recording) =>
      this.awsS3Service.getKeyFromUrl(recording.recordingS3Link),
    );
    await this.awsS3Service.deleteFiles([
      ...allRecordings,
      `/${user.id}/${device.location.id}/${device.id}/`,
    ]);

    //Delete recordings in db
    await Promise.all(
      device.recordings.map(async (recording) =>
        this.recordingService.deleteRecordingWithoutDeletingInS3(
          user.id,
          recording.id,
        ),
      ),
    );

    return this.deviceRepository.delete({ id: device.id });
  }
  //CRUD Services End

  // Utility Services Start
  public async deleteDeviceWithoutDeletingInS3(user: User, deviceId: string) {
    const device = await this.deviceRepository.findOne({
      where: {
        id: deviceId,
        location: {
          users: {
            id: user.id,
          },
        },
      },
    });
    if (!device) {
      throw new BadRequestException('Location not found');
    }
    return this.deviceRepository.delete(device.id);
  }

  public async createDefaultDevice() {
    const device = this.deviceRepository.create();
    device.type = DeviceType.Web;
    device.name = 'Default Device';
    return await this.deviceRepository.save(device);
  }
  public async createDeviceFolderS3(options: {
    userUUID: string;
    locationId: string;
    device: Device;
  }) {
    const { userUUID, locationId, device } = options;
    try {
      return await this.awsS3Service.createFolder({
        path: `/${userUUID}/${locationId}/${device.id}`,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      this.deviceRepository.delete(device.id);
      throw new InternalServerErrorException(
        'Error creating folder s3',
        error?.name,
      );
    }
  }
  public async findDeviceById(options: {
    id: string;
    relations?: FindOneOptions<Device>['relations'];
  }) {
    const { relations, id } = options;

    const user = await this.deviceRepository.findOne({
      where: {
        id,
      },
      relations,
    });
    return user;
  }
  // Utility Services End
}
