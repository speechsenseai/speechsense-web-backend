import { serializeUser } from './serializers/user.serialize';
import { UpdateUserDto } from './dto/updateUser.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from '../auth/dto/signup.dto';
import { Location } from '../location/entities/location.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}
  public async getUsers(userId: string) {
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
  public async findUserByEmail(email: string) {
    return this.userRepository.findOne({
      where: {
        email,
      },
    });
  }
  public async findUserById(id: string) {
    return this.userRepository.findOne({
      where: {
        id,
      },
    });
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
    user: SignUpDto & {
      isGoogle?: boolean;
      isEmail?: boolean;
      isVerified?: boolean;
    },
  ) {
    return serializeUser(await this.userRepository.save(user));
  }

  public async activateUser(id: string) {
    const user = await this.findUserById(id);
    if (user.isVerified) {
      throw new BadRequestException('Email already verified');
    }
    const userUpdated = await this.update(id, { isVerified: true });
    return serializeUser(userUpdated);
  }
}
