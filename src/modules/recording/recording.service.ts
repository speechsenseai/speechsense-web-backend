import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { DeviceService } from '../device/device.service';
import { AwsS3Service } from 'src/common/aws-s3/aws-s3.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Recording } from './entities/recording.entity';
import { Repository } from 'typeorm';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { RabbitMqService } from 'src/common/rabbitmq/rabbitmq.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RecordingService {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly awsS3Servie: AwsS3Service,
    private readonly rabbitMqService: RabbitMqService,
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
    const path = `/${user.id}/${device?.location.id}/${device?.id}/`;
    const filenameSplit = file.originalname.split('.');
    const filename = `${filenameSplit[0]}-${uuidv4()}.${filenameSplit[1]}`;
    const res = await this.awsS3Servie.uploadMp3File({
      fileBuffer: file.buffer,
      path: path,
      fileName: filename,
    });
    if (!res.url.includes(filename)) {
      const recording = this.recordingRepository.create({
        recordingS3Link: res.url,
      });
      recording.device = device;
      const recordingSaved = await this.recordingRepository.save(recording);
      await this.rabbitMqService.sendMessage({
        body: JSON.stringify({
          record_id: filename,
          record_tstamp: recordingSaved.createdAt,
          user_id: user.id,
          device_id: device.id,
          location_id: device.location.id,
        }),
      });
      return recordingSaved;
    }
    return this.recordingRepository.findOne({
      where: {
        recordingS3Link: res.url,
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
}
