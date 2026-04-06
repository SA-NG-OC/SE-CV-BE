// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MailModule } from 'src/shared/mail/mail.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleOAuthGuard } from './guards/google.guard';
import { MailQueueService } from 'src/shared/mail/mail-queue.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET')!,
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d') as any
        },
      }),
    }),
    MailModule,
  ],
  providers: [AuthService, JwtStrategy, GoogleStrategy, GoogleOAuthGuard, MailQueueService],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule { }

