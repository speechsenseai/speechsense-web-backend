import { MigrationInterface, QueryRunner } from 'typeorm';

export class TransferUserNameToProfile1725895278838
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the Profile table
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "profile" (
                "id" SERIAL PRIMARY KEY,
                "name" character varying,
                "userId" integer UNIQUE,
                CONSTRAINT "FK_user_profile" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
            )
        `);

    // Transfer name data from User to Profile
    await queryRunner.query(`
            INSERT INTO "profile" ("name", "userId")
            SELECT "name", "id" FROM "user"
        `);

    // Remove the name column from the User table
    await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "name"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add the name column back to the User table
    await queryRunner.query(`
            ALTER TABLE "user" ADD "name" character varying
        `);

    // Transfer name data back from Profile to User
    await queryRunner.query(`
            UPDATE "user" u
            SET "name" = p."name"
            FROM "profile" p
            WHERE u."id" = p."userId"
        `);

    // Drop the Profile table
    await queryRunner.query(`
            DROP TABLE "profile"
        `);
  }
}
