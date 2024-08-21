import { VerificationModule } from './modules/verification/verification.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'dotenv/config';
import { UserModule } from './modules/users/user.module';
import { User } from './modules/users/entities/user.entity';

@Module({
    imports: [
        AuthModule,
        UserModule,
        VerificationModule,
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            synchronize: process.env.NODE_ENV === 'development' ? true : false,
            entities: [User],
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
