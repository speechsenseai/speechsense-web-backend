import { Recording } from '@/modules/recording/entities/recording.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class FillMetricIds1727023974793 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const recordingRepo = queryRunner.connection.getRepository(Recording);
    const recordings = await recordingRepo.find();
    await Promise.all(
      recordings.map(async (recording) => {
        if (recording.metric_id) return;
        const metric_id = recording.recordingS3Link
          .split('/')
          .pop()
          ?.replace('.mp3', '');
        if (!metric_id) return;
        recording.metric_id = metric_id;
        await recordingRepo.save(recording);
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const recordingRepo = queryRunner.connection.getRepository(Recording);
    const recordings = await recordingRepo.find();
    await Promise.all(
      recordings.map(async (recording) => {
        if (!recording.metric_id) return;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        recording.metric_id = null;
        await recordingRepo.save(recording);
      }),
    );
  }
}
