/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { Profile } from '@/modules/profile/entities/profile.entity';
import { User } from '@/modules/users/entities/user.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class Addprofile1725902299056 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const userRepo = queryRunner.connection.getRepository(User);
    const profileRepo = queryRunner.connection.getRepository(Profile);
    const users = await userRepo.find();

    await Promise.all(
      users.map(async (user) => {
        if (user.profile) return;
        const profile = profileRepo.create({
          name: user.name,
        });
        await profileRepo.save(profile);
        user.profile = profile;
        await userRepo.save(user);
      }),
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "name";`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "name" character varying;`);

    // Transfer name data back from Profile to User
    const userRepo = queryRunner.connection.getRepository(User);
    const users = await userRepo.find({ relations: ['profile'] });
    await Promise.all(
      users.map(async (user) => {
        if (user.profile) {
          user.name = user.profile.name;
          await userRepo.save(user);
        }
      }),
    );

    // Remove the profile reference from User table
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "profileId";`);

    // Drop the Profile table
    await queryRunner.query(`DROP TABLE "profile";`);
  }
}
