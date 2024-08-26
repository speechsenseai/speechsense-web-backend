import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { RecordingService } from './recording.service';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Recorgings')
@Controller('recording')
export class RecordingController {
  constructor(private readonly recordingService: RecordingService) {}
  @Get('')
  getRecordings() {
    return { message: 'success' };
  }
  @Post('upload-audio/:deviceId')
  @UseInterceptors(FileInterceptor('record'))
  uploadAudio(
    @Req() req,
    @Param('deviceId') deviceId: string,
    @UploadedFile() record: Express.Multer.File,
  ) {
    return this.recordingService.uploadAudio(req.user.user, deviceId, record);
  }
}
