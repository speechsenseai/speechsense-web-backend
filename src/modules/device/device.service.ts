import {
  BadRequestException,
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
import { AwsS3Service } from 'src/common/aws-s3/aws-s3.service';
import { ConnectDeviceDto } from './dto/ConnectDevice.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    private readonly locationService: LocationService,
    private readonly awsS3Service: AwsS3Service,
    private readonly jwtService: JwtService,
  ) {}
  public async getDevices(
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
  public async createDefaultDevice() {
    const device = this.deviceRepository.create();
    device.type = DeviceType.Web;
    return await this.deviceRepository.save(device);
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
}
