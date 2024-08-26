import { RecordingModule } from './modules/recording/recording.module';
import { DeviceModule } from './modules/device/device.module';
import { LocationModule } from './modules/location/location.module';
import { VerificationModule } from './modules/verification/verification.module';
import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'dotenv/config';
import { UserModule } from './modules/users/user.module';
import { User } from './modules/users/entities/user.entity';
import { Location } from './modules/location/entities/location.entity';
import { Device } from './modules/device/entities/device.entity';
import { Recording } from './modules/recording/entities/recording.entity';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    VerificationModule,
    LocationModule,
    DeviceModule,
    RecordingModule,
    ProfileModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV === 'development' ? true : false,
      entities: [User, Location, Device, Recording],
      ssl: {
        rejectUnauthorized:
          process.env.NODE_ENV === 'development' ? undefined : false,
      },
    }),
  ],
})
export class AppModule {}
