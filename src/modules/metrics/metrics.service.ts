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
        user_id: 'd515f640-e9d3-49fb-ad48-0c3985cbfb50',
      });
      return res.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error, 'axios');

        throw new InternalServerErrorException(error.response?.data);
      }
      console.log(error, 'error');

      throw error;
    }
  }
  async getInsightMetrics(user: User) {
    try {
      const res = await this.requester.post('/insights', {
        user_id: 'd515f640-e9d3-49fb-ad48-0c3985cbfb50',
        min_tstamp: '2024-01-29T09:50:08.973Z',
        max_tstamp: '2024-08-29T09:50:08.973Z',
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
