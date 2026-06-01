import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { I_CHAT_REPOSITORY } from './repositories/chat-repository.interface';
import { ChatRepository } from './repositories/chat.repository';
import { CompanyModule } from '../company/company.module';
import { StudentModule } from '../student/student.module';
import { CloudinaryModule } from 'src/shared/cloudinary/cloudinary.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
    CompanyModule,
    StudentModule,
    CloudinaryModule,
  ],
  controllers: [ChatController],
  providers: [
    ChatGateway,
    ChatService,
    {
      provide: I_CHAT_REPOSITORY,
      useClass: ChatRepository,
    },
  ],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
