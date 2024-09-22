import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { RecordingService } from './recording.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { ForDevice } from '@/decorators/forDevice';

const MAX_FILE_SIZE = 10000000000;
@ApiTags('Recordings')
@Controller('recordings')
export class RecordingController {
  constructor(private readonly recordingService: RecordingService) {}
  @Get('all')
  getAllRecordings(
    @Req() req,
    @Paginate() query: PaginateQuery,
    @Query('locationId') locationId?: string,
    @Query('deviceId') deviceId?: string,
  ) {
    return this.recordingService.getAllRecordings(
      req.user.sub,
      query,
      locationId,
      deviceId,
    );
  }
  @Get('one/:recordingCriteria')
  getRecording(
    @Req() req,
    @Param('recordingCriteria') recordingCriteria: string,
    @Query('withDeviceAndLocation') withDeviceAndLocation?: string,
    @Query('useMetricId') useMetricId?: string,
  ) {
    return this.recordingService.getOneRecording(
      req.user.sub,
      recordingCriteria,
      JSON.parse(withDeviceAndLocation ?? 'false'),
      JSON.parse(useMetricId ?? 'false'),
    );
  }
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
            message: 'File is too large',
          }),
        ],
        fileIsRequired: true,
      }),
    )
    record: Express.Multer.File,
  ) {
    return this.recordingService.uploadAudio(req.user.user, deviceId, record);
  }

  @Post('upload-audio-device')
  @ForDevice()
  @UseInterceptors(FileInterceptor('record'))
  uploadAudioDevice(
    @Req() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: MAX_FILE_SIZE,
            message: 'File is too large',
          }),
        ],
        fileIsRequired: true,
      }),
    )
    record: Express.Multer.File,
  ) {
    return this.recordingService.uploadAudio(
      req.user.device.user,
      req.user.device.device.id,
      record,
    );
  }
}
