import { RestaurantModule } from './modules/restaurant/restaurant.module';
import { VerificationModule } from './modules/verification/verification.module';
import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'dotenv/config';
import { UserModule } from './modules/users/user.module';
import { User } from './modules/users/entities/user.entity';
import { Restaurant } from './modules/restaurant/entities/restaurant.entity';
import { Device } from './modules/device/entities/device.entity';
import { Recording } from './modules/recording/entities/recording.entity';

@Module({
  imports: [
    AuthModule,
    UserModule,
    VerificationModule,
    RestaurantModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV === 'development' ? true : false,
      entities: [User, Restaurant, Device, Recording],
    }),
  ],
})
export class AppModule {}
