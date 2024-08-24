import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Device, DeviceType } from './entities/device.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
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
  public async createDefaultDevice() {
    const device = this.deviceRepository.create();
    device.type = DeviceType.Web;
    return await this.deviceRepository.save(device);
  }
}
