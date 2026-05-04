import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { I_CHAT_REPOSITORY } from './repositories/chat-repository.interface';
import { ChatRepository } from './repositories/chat.repository';
import { CompanyModule } from '../company/company.module';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [
    JwtModule,
    CompanyModule,
    StudentModule
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
export class ChatModule { }