import {
  Body,
  Controller,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiTags } from '@nestjs/swagger';
import { PatchProfileDto } from './dto/PatchProfile.dto';
import { FileInterceptor } from '@nestjs/platform-express';

const MAX_FILE_SIZE = 5000000;

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  @Get('')
  getProfile(@Req() req) {
    return this.profileService.getProfile(req.user.sub);
  }

  @Patch('')
  patchProfile(@Req() req, @Body() body: PatchProfileDto) {
    return this.profileService.updateByUserId(req.user.sub, body);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  uploadAvatar(
    @Req() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: MAX_FILE_SIZE,
            message: 'File is too large',
          }),
        ],
        fileIsRequired: false,
      }),
    )
    avatar: Express.Multer.File | null,
  ) {
    return this.profileService.uploadAvatar(req.user.sub, avatar);
  }
}
