import { Injectable, Logger } from '@nestjs/common';
import * as ffmpegPath from '@ffmpeg-installer/ffmpeg';
import * as ffmpeg from 'fluent-ffmpeg';
import { Readable, PassThrough } from 'stream';

@Injectable()
export class FfmpegService {
  constructor() {
    this.logger.log('FfmpegService Started');
    ffmpeg.setFfmpegPath(ffmpegPath.path);
    this.logger.log('FfmpegService Path Set');
    this.logger.log(`Path - ${ffmpegPath.path}`);
  }
  private readonly logger = new Logger(FfmpegService.name);

  async convertToMp3(file: Express.Multer.File): Promise<Buffer> {
    const inputBuffer = file.buffer;
    this.logger.log('Converting to MP3 Start');
    return new Promise((resolve, reject) => {
      const inputStream = new Readable();
      inputStream.push(inputBuffer);
      inputStream.push(null);

      const outputBuffers: Buffer[] = [];
      const outputStream = new PassThrough();

      ffmpeg(inputStream)
        .toFormat('mp3')
        .on('error', (err) => {
          this.logger.error(err);
          reject(err);
        })
        .on('end', () => {
          this.logger.log('Converting Finished');
          const outputBuffer = Buffer.concat(outputBuffers);
          resolve(outputBuffer);
        })
        .pipe(outputStream, { end: true });

      outputStream.on('data', (chunk) => {
        outputBuffers.push(chunk);
      });
    });
  }
}
