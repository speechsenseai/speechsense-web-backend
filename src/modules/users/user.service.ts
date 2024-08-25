import { DeviceService } from '../device/device.service';
import { LocationService } from '../location/location.service';
import { serializeUser } from './serializers/user.serialize';
import { UpdateUserDto } from './dto/updateUser.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { SignUpDto } from '../auth/dto/signup.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly locationService: LocationService,
    private readonly deviceService: DeviceService,
  ) {}
  public async getUsers(userId: string) {
    console.log(userId);

    const users = await this.userRepository.find({
      relations: {
        locations: true,
      },
    });
    // const location = await this.locationRepository.save({
    //   name: 'location',
    //   address: 'address',
    //   workingHours: 'workingHours',
    //   workingDays: 'workingDays',
    //   description: 'description',
    // });
    // users.forEach((user) => {
    //   if (!user.locations) {
    //     user.locations = [];
    //   }
    //   user.locations.push(location);
    // });
    // await this.userRepository.save(users);

    return users;
  }
  public async findUserByEmail(options: {
    email: string;
    relations?: FindOneOptions<User>['relations'];
    serialize?: boolean;
  }) {
    const { relations, serialize = true, email } = options;

    const user = await this.userRepository.findOne({
      where: {
        email,
      },
      relations,
    });
    if (serialize && user !== null) {
      return serializeUser(user);
    }
    return user;
  }
  public async findUserById(options: {
    id: string;
    relations?: FindOneOptions<User>['relations'];
    serialize?: boolean;
  }) {
    const { relations, serialize = true, id } = options;

    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations,
    });
    if (serialize && user !== null) {
      return serializeUser(user);
    }
    return user;
  }
  public async deleteUser(id: string) {
    return this.userRepository.delete(id);
  }
  public async save(user: User) {
    return this.userRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const userToUpdate = await this.userRepository.findOneBy({ id });
    const updatedUser = {
      ...userToUpdate,
      ...updateUserDto,
    };
    return this.userRepository.save(updatedUser);
  }

  public async createUser(
    user: Partial<
      SignUpDto & {
        isGoogle: boolean;
        isEmail: boolean;
        isVerified: boolean;
      }
    >,
  ) {
    return serializeUser(await this.userRepository.save(user));
  }

  public async activateUser(id: string) {
    const user = await this.findUserById({ id });
    if (user?.isVerified) {
      throw new BadRequestException('Email already verified');
    }
    const userUpdated = await this.update(id, { isVerified: true });
    return userUpdated;
  }

  public async createDefaultLocationDevice(user: User) {
    if (!user.locations) {
      const device = await this.deviceService.createDefaultDevice();
      const location = await this.locationService.createDefaultLocation(device);
      user.locations = [location];
      await this.save(user);
    }
    return user;
  }
}
