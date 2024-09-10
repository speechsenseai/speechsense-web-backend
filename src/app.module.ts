import { RecordingModule } from './modules/recording/recording.module';
import { DeviceModule } from './modules/device/device.module';
import { LocationModule } from './modules/location/location.module';
import { VerificationModule } from './modules/verification/verification.module';
import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'dotenv/config';
import { UserModule } from './modules/users/user.module';
import { ProfileModule } from './modules/profile/profile.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { RabbitMqModule } from './common/rabbitmq/rabbitmq.module';
import { DeviceStrategy } from './modules/device/guard/device.strategy';

@Module({
  imports: [
    AuthModule,
    UserModule,
    VerificationModule,
    LocationModule,
    DeviceModule,
    RecordingModule,
    ProfileModule,
    MetricsModule,
    RabbitMqModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrationsTableName: 'typeorm_migrations',
      synchronize: process.env.NODE_ENV === 'development' ? true : false,
      migrationsRun: true,
      ...(process.env.NODE_ENV === 'development'
        ? {}
        : {
            ssl: {
              rejectUnauthorized: false,
            },
          }),
    }),
  ],
  providers: [DeviceStrategy],
})
export class AppModule {}
