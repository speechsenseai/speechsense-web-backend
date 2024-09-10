import { DataSource } from 'typeorm';
import { join } from 'path';
import 'dotenv/config';

export const connectionSource = new DataSource({
  type: 'postgres',
  host:
    process.env.NODE_ENV === 'development' ? 'localhost' : process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: true,
  entities: [join(__dirname, '/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '/migrations/**/*{.ts,.js}')],
  synchronize: false,
  migrationsTableName: 'typeorm_migrations',
  migrationsRun: false,
});
