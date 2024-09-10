import {
  BadRequestException,
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

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    private readonly awsS3Service: AwsS3Service,
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
