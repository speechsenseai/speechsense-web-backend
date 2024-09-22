import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import axios, { AxiosInstance, isAxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MetricsService {
  private requester: AxiosInstance;
  constructor(private readonly configService: ConfigService) {
    this.requester = axios.create({
      baseURL: this.configService.get('AUDIO_METRICS_BACKEND_URL'),
    });
  }
  async getNumericMetrics(options: {
    user: User;
    locationId?: string;
    deviceId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { user, locationId, deviceId, startDate, endDate } = options;
    try {
      const res = await this.requester.post('/numeric_metrics', {
        user_id: user.id,
        location_id: locationId,
        device_id: deviceId,
        max_tstamp: endDate,
        min_tstamp: startDate,
      });
      return res.data;
    } catch (error) {
      if (isAxiosError(error)) {
        throw new InternalServerErrorException(error.response?.data);
      }
      throw error;
    }
  }
  async getInsightMetrics(options: {
    user: User;
    locationId?: string;
    deviceId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { user, locationId, deviceId, startDate, endDate } = options;
    try {
      const res = await this.requester.post('/insights', {
        user_id: user.id,
        location_id: locationId,
        device_id: deviceId,
        max_tstamp: endDate,
        min_tstamp: startDate,
      });
      return res.data;
    } catch (error) {
      if (isAxiosError(error)) {
        throw new InternalServerErrorException(error.response?.data);
      }
      throw error;
    }
  }
  async getProcessingStatus(user: User) {
    try {
      const res = await this.requester.post('/processing_status', {
        user_id: user.id,
      });
      return res.data;
    } catch (error) {
      if (isAxiosError(error)) {
        throw new InternalServerErrorException(error.response?.data);
      }
      throw error;
    }
  }
  async getRecordingLines(options: {
    user: User;
    locationId?: string;
    deviceId?: string;
    startDate?: string;
    endDate?: string;
    use_pagination?: string;
    offset?: string;
    n_lines?: string;
  }) {
    const {
      user,
      locationId,
      deviceId,
      startDate,
      endDate,
      use_pagination,
      offset,
      n_lines,
    } = options;
    try {
      const res = await this.requester.post('/get_transcribed_lines', {
        user_id: user.id,
        location_id: locationId,
        device_id: deviceId,
        max_tstamp: endDate,
        min_tstamp: startDate,
        use_pagination: use_pagination,
        offset: offset,
        n_lines: n_lines,
      });
      return res.data;
    } catch (error) {
      if (isAxiosError(error)) {
        throw new InternalServerErrorException(error.response?.data);
      }
      throw error;
    }
  }
}
