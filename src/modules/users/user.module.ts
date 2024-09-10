import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DeviceModule } from '../device/device.module';
import { LocationModule } from '../location/location.module';
import { AwsS3Module } from '@/common/aws-s3/aws-s3.module';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    DeviceModule,
    LocationModule,
    AwsS3Module,
    forwardRef(() => ProfileModule),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
