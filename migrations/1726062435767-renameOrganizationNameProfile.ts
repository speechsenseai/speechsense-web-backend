// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameOrganizationNameProfile1726062435767
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('profile', 'organiztionName')) {
      await queryRunner.renameColumn(
        'profile',
        'organiztionName',
        'organizationName',
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('profile', 'organizationName')) {
      await queryRunner.renameColumn(
        'profile',
        'organizationName',
        'organiztionName',
      );
    }
  }
}
