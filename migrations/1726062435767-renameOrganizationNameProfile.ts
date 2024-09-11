// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Profile } from '@/modules/profile/entities/profile.entity';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RenameOrganizationNameProfile1726062435767
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const profileRepo = queryRunner.connection.getRepository(Profile);
    const profiles = await profileRepo.find();

    await Promise.all(
      profiles.map(async (profile) => {
        if ((profile as any).organiztionName) {
          await queryRunner.changeColumn(
            'profile',
            new TableColumn({
              type: 'varchar',
              name: 'organiztionName',
              isNullable: true,
            }),
            new TableColumn({
              type: 'varchar',
              name: 'organizationName',
              isNullable: true,
            }),
          );
        }
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const profileRepo = queryRunner.connection.getRepository(Profile);
    const profiles = await profileRepo.find();

    await Promise.all(
      profiles.map(async (profile) => {
        if ((profile as any).organizationName) {
          await queryRunner.changeColumn(
            'profile',
            new TableColumn({
              type: 'varchar',
              name: 'organizationName',
              isNullable: true,
            }),
            new TableColumn({
              type: 'varchar',
              name: 'organiztionName',
              isNullable: true,
            }),
          );
        }
      }),
    );
  }
}
