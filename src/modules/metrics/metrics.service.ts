import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import axios, { AxiosInstance, isAxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';
import { Parser } from '@json2csv/plainjs';
import { RecordingService } from '../recording/recording.service';
import { Response } from 'express';

@Injectable()
export class MetricsService {
  private requester: AxiosInstance;
  constructor(
    private readonly configService: ConfigService,
    private readonly recordingService: RecordingService,
  ) {
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
  async getNumericByDayMetrics(options: {
    user: User;
    locationId?: string;
    deviceId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { user, locationId, deviceId, startDate, endDate } = options;
    try {
      const res = await this.requester.post('/numeric_insights_daily', {
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
      const res = await this.requester.post('/insights_from_transcript', {
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

  async downloadRecordingLines(
    res: Response,
    options: {
      user: User;
      locationId?: string;
      deviceId?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const { user, locationId, deviceId, startDate, endDate } = options;
    try {
      const resopnseMetric = await this.requester.post(
        '/get_transcribed_lines',
        {
          user_id: user.id,
          location_id: locationId,
          device_id: deviceId,
          max_tstamp: endDate,
          min_tstamp: startDate,
          use_pagination: false,
        },
      );

      // Get Recordings Objects by Metric Id
      const recordingsData = {};
      const metric_ids = [
        ...new Set<string>(
          resopnseMetric.data?.lines?.map(
            (line: { record_id: string }) => line.record_id,
          ),
        ),
      ];
      await Promise.all(
        metric_ids.map(async (metric_id) => {
          if (recordingsData[metric_id]) return;
          const recording = await this.recordingService.getOneRecording(
            user.id,
            metric_id,
            true,
            true,
          );
          recordingsData[metric_id] = recording;
        }),
      );
      // Generate CSV
      const parser = new Parser({
        header: false,
        fields: [
          'recordingLink',
          'device',
          'location',
          'engagement_index',
          'lineId',
          'speaker',
          'text',
          'start',
          'end',
        ],
      });
      const formattedLinesWithRecordings = resopnseMetric.data.lines.map(
        (line: RecordingLineItem) => {
          const recording = recordingsData[line.record_id];
          return {
            recordingLink: recording?.recordingS3Link,
            device: recording?.device?.name ?? recording?.device?.id,
            location:
              recording?.device?.location?.name ??
              recording?.device?.location?.id,

            engagement_index: line.engagement_index,
            lineId: line.id,
            speaker: line.speaker,
            text: line.text,
            start: line.start,
            end: line.end,
          };
        },
      );
      const csv = parser.parse([
        {
          recordingLink: 'Recording Link',
          device: 'Device',
          location: 'Location',
          lineId: 'Line ID',
          speaker: 'Speaker',
          text: 'Text',
          start: 'Start',
          end: 'End',
          engagement_index: 'Engagement Index',
        },
        ...formattedLinesWithRecordings,
      ]);

      res.setHeader('Content-disposition', 'attachment; filename=test_csv.csv');
      res.set('Content-Type', 'text/csv');
      return res.status(200).send(csv);
    } catch (error) {
      if (isAxiosError(error)) {
        throw new InternalServerErrorException(error.response?.data);
      }
      throw error;
    }
  }
}
interface RecordingLineItem {
  id: string;
  record_id: string;
  speaker: string;
  text: string;
  start: string;
  end: string;
  engagement_index: number;
}
