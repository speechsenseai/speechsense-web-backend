import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { FindOneOptions, Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProfileService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
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

  async update(id: string, updateProfileBody: Profile) {
    const profileToUpdate = await this.profileRepository.findOneBy({ id });
    const updatedProfile = {
      ...profileToUpdate,
      ...updateProfileBody,
    };
    return this.profileRepository.save(updatedProfile);
  }

  public async createProfile(profilePayload: Partial<Profile>) {
    return await this.profileRepository.save(profilePayload);
  }
}
