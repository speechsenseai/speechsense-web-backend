import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { AwsS3Service } from './aws-s3.service';
import 'dotenv/config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: AWS.S3,
      useFactory: async (configService: ConfigService) => {
        AWS.config.update({
          accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
          secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
          region: configService.get('AWS_REGION'),
        });

        return new AWS.S3();
      },
      inject: [ConfigService],
    },
    AwsS3Service,
  ],
  exports: [AwsS3Service],
})
export class AwsS3Module {}
