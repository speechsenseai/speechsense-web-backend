import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UserService } from '../users/user.service';
import { FindOneOptions, Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AwsS3Service } from '@/common/aws-s3/aws-s3.service';
import { v4 as uuidv4 } from 'uuid';
import { sanitazeFilname } from '@/common/lib/sanitazeFilename';

@Injectable()
export class ProfileService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly awsS3Service: AwsS3Service,
  ) {}
  async getProfile(userId: string) {
    return this.userService.findUserById({
      id: userId,
      relations: {
        profile: true,
      },
    });
  }

  public async findUserById(options: {
    id: string;
    relations?: FindOneOptions<Profile>['relations'];
    where?: FindOneOptions<Profile>['where'];
  }) {
    const { relations, id, where } = options;

    const profile = await this.profileRepository.findOne({
      where: {
        ...where,
        id,
      },
      relations,
    });
    return profile;
  }
  public async deleteProfile(id: string) {
    return this.profileRepository.delete(id);
  }
  public async save(profile: Profile) {
    return this.profileRepository.save(profile);
  }

  async updateByUserId(
    id: string,
    updateProfileBody: Omit<Partial<Profile>, 'user'>,
  ) {
    const user = await this.userService.findUserById({
      id,
      relations: { profile: true },
    });
    const profileToUpdate = user?.profile;
    const updatedProfile = {
      ...profileToUpdate,
      ...updateProfileBody,
    };
    return this.profileRepository.save(updatedProfile);
  }
  async update(id: string, updateProfileBody: Omit<Partial<Profile>, 'user'>) {
    const profileToUpdate = await this.findUserById({
      id,
    });
    const updatedProfile = {
      ...profileToUpdate,
      ...updateProfileBody,
    };
    return this.profileRepository.save(updatedProfile);
  }

  public async createProfile(profilePayload: Partial<Profile>) {
    return await this.profileRepository.save(profilePayload);
  }

  public async uploadAvatar(userId: string, file: Express.Multer.File | null) {
    const user = await this.userService.findUserById({
      id: userId,
      relations: { profile: true },
    });

    const profile = user?.profile;
    if (!profile) {
      throw new BadRequestException('Profile not found');
    }
    const filename = profile.avatarUrl?.split('/').pop();
    const currentPathAvatarUrl = `/avatars/${filename}`;

    if (!file) {
      await this.awsS3Service.deleteFile(currentPathAvatarUrl);
      return await this.update(profile.id, {
        avatarUrl: null,
      });
    } else {
      await this.awsS3Service.deleteFile(currentPathAvatarUrl);

      const res = await this.awsS3Service.uploadFile({
        fileBuffer: file.buffer,
        path: `avatars/`,
        fileName: `${profile.id}_${uuidv4()}_${sanitazeFilname(file.originalname)}`,
        contentType: file.mimetype,
      });
      return await this.update(profile.id, {
        avatarUrl: res.url,
      });
    }
  }
}
