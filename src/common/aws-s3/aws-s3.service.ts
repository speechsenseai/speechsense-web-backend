import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import 'dotenv/config';

@Injectable()
export class AwsS3Service {
  private s3: S3Client;
  private bucketName = this.configService.get('AWS_PUBLIC_BUCKET_NAME')!;
  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY')!,
      },
    });
  }

  async uploadMp3File(options: {
    fileBuffer: Buffer;
    path: string;
    fileName: string;
  }) {
    const { fileBuffer, path, fileName } = options;
    const key = `${path.startsWith('/') ? '' : '/'}${path}${path.endsWith('/') ? '' : '/'}${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: 'audio/mpeg',
      Metadata: {
        originalName: fileName,
      },
    });
    await this.s3.send(command);
    return {
      url: this.getFileUrl(key).url,
      key,
    };
  }

  async createFolder(options: { path: string }) {
    const { path } = options;
    const key = `${path.startsWith('/') ? '' : '/'}${path}${path.endsWith('/') ? '' : '/'}`;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: '',
    });
    await this.s3.send(command);

    return {
      url: (await this.getFileUrl(key)).url,
      key,
    };
  }

  getFileUrl(key: string) {
    return {
      url: `https://${this.bucketName}.s3.amazonaws.com/${key}`,
    };
  }

  async getPresignedSignedUrl(key: string) {
    //Don't need at the moment FIX_ME
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.s3, command, {
        expiresIn: 60 * 60 * 24, // 24 hours
      });

      return { url };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
