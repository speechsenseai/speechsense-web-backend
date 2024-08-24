import { Injectable } from '@nestjs/common';
import { UserService } from '../users/user.service';

@Injectable()
export class ProfileService {
  constructor(private readonly userService: UserService) {}
  async getProfile(userId: string) {
    return this.userService.findUserById({
      id: userId,
      relations: { locations: { devices: true, users: true } },
    });
  }
}
