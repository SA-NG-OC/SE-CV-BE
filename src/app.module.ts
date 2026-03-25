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
import { NotificationsGateway } from './notifications/notifications.gateway';
import { NotificationsModule } from './notifications/notifications.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    MailModule,
    EventEmitterModule.forRoot({
      wildcard: true,
      maxListeners: 11
    }),
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
    StudentModule,
    NotificationsModule
  ],
  controllers: [AppController],
  providers: [AppService, EventsGateway, NotificationsGateway],
})
export class AppModule { }
