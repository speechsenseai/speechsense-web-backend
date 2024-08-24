import { BadRequestException, Injectable } from '@nestjs/common';
import { Location } from './entities/location.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from '../device/entities/device.entity';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { CreateLocationDto } from './dto/CreateLocation.dto';
import { UserService } from '../users/user.service';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    private readonly userService: UserService,
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
  public async getOneLocation(userId: string, locationId: string) {
    return this.locationRepository.findOne({
      where: {
        id: locationId,
        users: {
          id: userId,
        },
      },
    });
  }
  public async createLocation(userId: string, body: CreateLocationDto) {
    const user = await this.userService.findUserById({ id: userId });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const location = this.locationRepository.create(body);
    location.users = [user];
    return await this.locationRepository.save(location);
  }

  public async createDefaultLocation(device: Device) {
    const location = this.locationRepository.create();
    location.name = 'My Default Location';
    location.description = 'This is the default location';
    location.devices = [device];
    return await this.locationRepository.save(location);
  }
}
