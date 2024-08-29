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
  async getNumericMetrics(user: User) {
    try {
      const res = await this.requester.post('/numeric_metrics', {
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
  async getInsightMetrics(user: User) {
    try {
      const res = await this.requester.post('/insights', {
        user_id: user.id,
        min_tstamp: '2020-01-29T09:50:08.973Z', //FIX_ME
        max_tstamp: new Date().toISOString(),
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
