import { BadRequestException, Injectable } from '@nestjs/common';
import { FindOneOptions, Repository } from 'typeorm';
import { Device, DeviceType } from './entities/device.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { CreateDeviceDto } from './dto/CreateDevice.dto';
import { User } from '../users/entities/user.entity';
import { LocationService } from '../location/location.service';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    private readonly locationService: LocationService,
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
    return await this.deviceRepository.save(device);
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
}
