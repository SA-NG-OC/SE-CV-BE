import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { MailModule } from './mail/mail.module';
import { CompanyModule } from './company/company.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { EventsGateway } from './events/events.gateway';
import { ThrottlerModule } from '@nestjs/throttler';
import { StudentModule } from './student/student.module';


@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    MailModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    CompanyModule,
    CloudinaryModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ]

    }),
    StudentModule
  ],
  controllers: [AppController],
  providers: [AppService, EventsGateway],
})
export class AppModule { }
