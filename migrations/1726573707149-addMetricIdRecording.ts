import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddMetricIdRecording1726573707149 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'recording',
      new TableColumn({
        name: 'metric_id',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('recording', 'metric_id');
  }
}
