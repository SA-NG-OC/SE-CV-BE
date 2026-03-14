import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    MailModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
