import { DeviceService } from '../device/device.service';
import { LocationService } from '../location/location.service';
import { serializeUser } from './serializers/user.serialize';
import { UpdateUserDto } from './dto/updateUser.dto';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { SignUpDto } from '../auth/dto/signup.dto';
import { AwsS3Service } from '@/common/aws-s3/aws-s3.service';
import { Profile } from '../profile/entities/profile.entity';
import { ProfileService } from '../profile/profile.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly locationService: LocationService,
    private readonly deviceService: DeviceService,
    private readonly awsS3Service: AwsS3Service,
    @Inject(forwardRef(() => ProfileService))
    private readonly profileService: ProfileService,
  ) {}
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
    where?: FindOneOptions<User>['where'];

    serialize?: boolean;
  }) {
    const { relations, serialize = true, id, where } = options;

    const user = await this.userRepository.findOne({
      where: {
        ...where,
        id,
      },
      relations,
    });
    if (serialize && user !== null) {
      return serializeUser(user);
    }
    return user;
  }
  public async deleteUserWithProfile(id: string) {
    const user = await this.findUserById({
      id,
      serialize: false,
      relations: { profile: true },
    });
    if (user?.profile.id) {
      await this.profileService.deleteProfile(user?.profile.id);
    }
    return await this.userRepository.delete(id);
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
    userPayload: Partial<
      SignUpDto & {
        isGoogle: boolean;
        isEmail: boolean;
        isVerified: boolean;
      }
    >,
    profile: Profile,
  ) {
    const user = this.userRepository.create(userPayload);
    user.profile = profile;
    await this.userRepository.save(user);
    return serializeUser(user);
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
      await this.createFolderS3(user, location.id, device.id);
      user.locations = [location];
      await this.save(user);
    }
    return user;
  }
  public async createFolderS3(
    user: User,
    locationId: string,
    deviceId: string,
  ) {
    try {
      const path = `/${user.id}/${locationId}/${deviceId}`;
      await this.awsS3Service.createFolder({ path });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      await this.deleteUserWithProfile(user.id); //FIX_ME может быть это будет багом, но сейчас это выглядит правильно
      throw new InternalServerErrorException(
        'Error creating folder s3',
        error?.name,
      );
    }
  }
}
