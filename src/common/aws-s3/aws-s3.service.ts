import { Injectable, Inject } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import 'dotenv/config';

@Injectable()
export class AwsS3Service {
  constructor(@Inject(AWS.S3) private readonly s3: AWS.S3) {}

  async uploadMp3File(options: {
    fileBuffer: Buffer;
    path: string;
    fileName: string;
  }): Promise<AWS.S3.ManagedUpload.SendData> {
    const { fileBuffer, path, fileName } = options;
    const key = `${path.startsWith('/') ? '' : '/'}${path}${path.endsWith('/' ? '' : '/')}${fileName}`;

    const params = {
      Bucket: process.env.AWS_PUBLIC_BUCKET_NAME!,
      Key: key,
      Body: fileBuffer,
      ContentType: 'audio/mpeg',
    };

    return this.s3.upload(params).promise();
  }
}
