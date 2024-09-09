import { DataSource } from 'typeorm';
import { join } from 'path';
import 'dotenv/config';

console.log(join(__dirname, '/**/*.entity{.ts,.js}'));

export const connectionSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: true,
  entities: [join(__dirname, '/../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '/../migrations/**/*{.ts,.js}')],
  synchronize: false,
  migrationsTableName: 'typeorm_migrations',
  migrationsRun: false,
});
