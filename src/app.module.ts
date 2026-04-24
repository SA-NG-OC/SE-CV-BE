import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './shared/redis/redis.module';
import { MailModule } from './shared/mail/mail.module';
import { CompanyModule } from './modules/company/company.module';
import { CloudinaryModule } from './shared/cloudinary/cloudinary.module';
import { EventsGateway } from './events/events.gateway';
import { ThrottlerModule } from '@nestjs/throttler';
import { StudentModule } from './modules/student/student.module';
import { NotificationsGateway } from './modules/notifications/notifications.gateway';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JobPostingModule } from './modules/job-posting/job-posting.module';
import { BullModule } from '@nestjs/bullmq';
import { ApplicationModule } from './modules/application/application.module';
import { CommentModule } from './modules/comment/comment.module';
import { CategoryModule } from './modules/category/category.module';

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    MailModule,
    EventEmitterModule.forRoot({
      wildcard: true,
      maxListeners: 11
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
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
    NotificationsModule,
    JobPostingModule,
    ApplicationModule,
    CommentModule,
    CategoryModule
  ],
  controllers: [AppController],
  providers: [AppService, EventsGateway, NotificationsGateway],
})
export class AppModule { }
