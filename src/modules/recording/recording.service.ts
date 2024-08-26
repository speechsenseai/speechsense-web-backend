import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { DeviceService } from '../device/device.service';
import { AwsS3Service } from 'src/common/aws-s3/aws-s3.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Recording } from './entities/recording.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RecordingService {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly awsS3Servie: AwsS3Service,
    @InjectRepository(Recording)
    private readonly recordingRepository: Repository<Recording>,
  ) {}
  async uploadAudio(user: User, deviceId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    const device = await this.deviceService.findDeviceById({
      id: deviceId,
      relations: { location: true },
    });
    if (!device?.id) {
      throw new BadRequestException('Device not found');
    }
    if (!device?.location.id) {
      throw new BadRequestException('Location not found');
    }

    const res = await this.awsS3Servie.uploadMp3File({
      fileBuffer: file.buffer,
      userUUID: user.id,
      locationUUID: device?.location.id,
      deviceUUID: device?.id,
      fileName: file.originalname,
    });
    const recording = this.recordingRepository.create({
      recordingS3Link: res.Location,
    });
    recording.device = device;
    return await this.recordingRepository.save(recording);
  }
}
