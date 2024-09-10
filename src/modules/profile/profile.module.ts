import { forwardRef, Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { UserModule } from '../users/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { AwsS3Module } from '@/common/aws-s3/aws-s3.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    AwsS3Module,
    TypeOrmModule.forFeature([Profile]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
