import { Controller, Get, Req } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  @Get('')
  getProfile(@Req() req) {
    return this.profileService.getProfile(req.user.sub);
  }
}
