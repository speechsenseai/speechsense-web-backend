import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { RecordingService } from './recording.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Paginate, PaginateQuery } from 'nestjs-paginate';

const MAX_FILE_SIZE = 1000000000;
@ApiTags('Recordings')
@Controller('recordings')
export class RecordingController {
  constructor(private readonly recordingService: RecordingService) {}
  @Get(':deviceId')
  getRecordings(
    @Req() req,
    @Paginate() query: PaginateQuery,
    @Param('deviceId') deviceId: string,
  ) {
    return this.recordingService.getRecordings(req.user.sub, deviceId, query);
  }
  @Post('upload-audio/:deviceId')
  @UseInterceptors(FileInterceptor('record'))
  uploadAudio(
    @Req() req,
    @Param('deviceId') deviceId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: MAX_FILE_SIZE,
            message: 'File is too large. Max file size is 1gb',
          }),
        ],
        fileIsRequired: true,
      }),
    )
    record: Express.Multer.File,
  ) {
    return this.recordingService.uploadAudio(req.user.user, deviceId, record);
  }
}
