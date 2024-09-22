import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { DeviceService } from '../device/device.service';
import { AwsS3Service } from '@/common/aws-s3/aws-s3.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Recording } from './entities/recording.entity';
import { Repository } from 'typeorm';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { RabbitMqService } from '@/common/rabbitmq/rabbitmq.service';
import { v4 as uuidv4 } from 'uuid';
import {
  extractFilenameWithoutExtension,
  sanitazeFilname,
} from '@/common/lib/sanitazeFilename';

@Injectable()
export class RecordingService {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly awsS3Servie: AwsS3Service,
    private readonly rabbitMqService: RabbitMqService,
    @InjectRepository(Recording)
    private readonly recordingRepository: Repository<Recording>,
  ) {}
  private readonly logger = new Logger(RecordingService.name);
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
    const path = `/${user.id}/${device?.location.id}/${device?.id}/`;
    const filename = sanitazeFilname(file.originalname, uuidv4());

    const res = await this.awsS3Servie.uploadFile({
      fileBuffer: file.buffer,
      path: path,
      fileName: filename,
      contentType: 'audio/mpeg',
    });
    const foundRecording = await this.recordingRepository.findOne({
      where: {
        recordingS3Link: res.url,
      },
    });
    if (!foundRecording) {
      const recording = this.recordingRepository.create({
        recordingS3Link: res.url,
        metric_id: extractFilenameWithoutExtension(filename),
      });
      recording.device = device;
      try {
        const recordingSaved = await this.recordingRepository.save(recording);
        await this.rabbitMqService.sendMessage({
          body: JSON.stringify({
            record_id: extractFilenameWithoutExtension(filename),
            record_tstamp: recordingSaved.createdAt,
            user_id: user.id,
            device_id: device.id,
            location_id: device.location.id,
            message_type: 'add',
          }),
        });
        return recordingSaved;
      } catch (error) {
        this.logger.error('Error sending recording to rabbitmq', error);
        throw new InternalServerErrorException(error);
      }
    }
    return foundRecording;
  }
  async getAllRecordings(
    userId: string,
    query: PaginateQuery,
    locationId?: string,
    deviceId?: string,
  ) {
    return paginate(query, this.recordingRepository, {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['recordingS3Link'],
      maxLimit: 10,
      defaultLimit: 10,
      where: {
        device: {
          ...(deviceId ? { id: deviceId } : {}),
          location: {
            ...(locationId ? { id: locationId } : {}),
            users: {
              id: userId,
            },
          },
        },
      },
    });
  }
  public async getRecordings(
    userId: string,
    deviceId: string,
    query: PaginateQuery,
  ) {
    return paginate(query, this.recordingRepository, {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['recordingS3Link'],
      maxLimit: 10,
      defaultLimit: 10,
      where: {
        device: {
          id: deviceId,
          location: {
            users: {
              id: userId,
            },
          },
        },
      },
    });
  }
  async getOneRecording(
    userId: string,
    recordingId: string,
    withDeviceAndLocation?: boolean,
  ) {
    return this.recordingRepository.findOne({
      where: {
        id: recordingId,
        device: {
          location: {
            users: {
              id: userId,
            },
          },
        },
      },
      relations: withDeviceAndLocation ? ['device', 'device.location'] : [],
    });
  }

  async deleteRecordingWithoutDeletingInS3(
    userId: string,
    recordingId: string,
  ) {
    const recording = await this.getOneRecording(userId, recordingId);
    if (!recording) {
      throw new BadRequestException('Recording not found');
    }
    try {
      await this.recordingRepository.delete(recordingId);
      return recording;
    } catch (error) {
      this.logger.error('Error deleting recording', error);
      throw new InternalServerErrorException(error);
    }
  }
}
