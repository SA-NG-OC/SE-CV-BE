import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { I_CHAT_REPOSITORY, type IChatRepository } from './repositories/chat-repository.interface';
import { ChatMapper } from './domain/chat.mapper';
import { GetMessagesDto, MarkReadDto, SetBlockedDto, SetHiddenDto } from './dto/chat.dto';
import { Role } from 'src/common/types/role.enum';
import { ConversationListItemView, MessageView, ParticipantStatusView } from './types';
import { I_COMPANY_REPOSITORY } from '../company/company.tokens';
import type { ICompanyRepository } from '../company/repositories/company-repository.interface';
import { I_STUDENT_REPOSITORY } from '../student/student.token';
import type { IStudentRepository } from '../student/repositories/student-repository.interface';

@Injectable()
export class ChatService {
  constructor(
    @Inject(I_CHAT_REPOSITORY)
    private readonly chatRepo: IChatRepository,
    @Inject(I_COMPANY_REPOSITORY)
    private readonly companyRepo: ICompanyRepository,
    @Inject(I_STUDENT_REPOSITORY)
    private readonly studentRepo: IStudentRepository,
  ) { }

  // =========================================================================
  // GET OR CREATE CONVERSATION
  // =========================================================================

  async getOrCreateConversation(
    companyId: number,
    studentId: number,
  ): Promise<{ conversationId: number; isNew: boolean }> {
    let conversation = await this.chatRepo.findConversationByCompanyAndStudent(companyId, studentId);
    let isNew = false;

    if (!conversation) {
      conversation = await this.chatRepo.createConversation({
        company_id: companyId,
        student_id: studentId,
        last_message_at: new Date(),
        created_at: new Date(),
      });
      isNew = true;
    }

    const conversationId = conversation.conversation_id;
    await this.ensureParticipant(conversationId, companyId, Role.COMPANY);
    await this.ensureParticipant(conversationId, studentId, Role.STUDENT);

    return { conversationId, isNew };
  }

  private async ensureParticipant(
    conversationId: number,
    actorId: number,
    role: Role,
  ): Promise<void> {
    let userId: number;

    if (role === Role.STUDENT) {
      const student = await this.studentRepo.findRawById(actorId);
      if (!student) throw new NotFoundException('Không tìm thấy sinh viên');
      userId = student;
    } else {
      const company = await this.companyRepo.findRawById(actorId);
      if (!company) throw new NotFoundException('Không tìm thấy công ty');
      userId = company;
    }

    const existing = await this.chatRepo.findParticipant(conversationId, userId);
    if (!existing) {
      await this.chatRepo.createParticipant({
        conversation_id: conversationId,
        user_id: userId,
        is_hidden: false,
        is_blocked: false,
        last_read_message_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }
  }

  // =========================================================================
  // SEND MESSAGE
  // =========================================================================

  async sendMessage(
    conversationId: number,
    senderId: number,
    content: string,
  ): Promise<{ message: MessageView; recipientUserIds: number[] }> {
    const trimmed = content.trim();
    if (!trimmed) throw new ForbiddenException('Nội dung tin nhắn không được để trống');

    const { isMember, isBlocked, recipientIds } = await this.chatRepo.validateSendContext(
      conversationId,
      senderId,
    );

    if (!isMember) throw new ForbiddenException('Bạn không thuộc cuộc trò chuyện này');
    if (isBlocked) throw new ForbiddenException('Không thể gửi tin nhắn vì cuộc trò chuyện đã bị chặn');


    const saved = await this.chatRepo.createMessageAndUpdateConversation({
      conversation_id: conversationId,
      sender_id: senderId,
      content: trimmed,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return {
      message: ChatMapper.toMessageView(saved, senderId),
      recipientUserIds: recipientIds,
    };
  }

  // =========================================================================
  // GET MESSAGES
  // =========================================================================

  async getMessages(
    conversationId: number,
    requesterId: number,
    dto: GetMessagesDto,
  ): Promise<{ messages: MessageView[]; nextCursor: number | null }> {
    const participant = await this.chatRepo.findParticipant(conversationId, requesterId);
    if (!participant) {
      throw new ForbiddenException('Bạn không có quyền xem cuộc trò chuyện này');
    }

    const rows = await this.chatRepo.getMessages({
      conversationId,
      cursor: dto.cursor,
      limit: dto.limit,
    });

    return {
      messages: rows.map((r) => ChatMapper.toMessageView(r, requesterId)),
      nextCursor: rows.length === dto.limit ? rows[0].message_id : null,
    };
  }

  // =========================================================================
  // CONVERSATION LIST
  // =========================================================================

  async getConversations(userId: number, roleId: number): Promise<ConversationListItemView[]> {
    const role = roleId === Role.STUDENT ? 'student' : 'company';
    const rows = await this.chatRepo.getConversationListForUser(userId, role);
    return rows.map(ChatMapper.toConversationListItemView);
  }

  // =========================================================================
  // MARK READ
  // =========================================================================

  async markRead(userId: number, dto: MarkReadDto): Promise<void> {
    const participant = await this.chatRepo.findParticipant(dto.conversationId, userId);
    if (!participant) {
      throw new ForbiddenException('Bạn không có quyền thực hiện hành động này');
    }

    const message = await this.chatRepo.findMessageById(dto.messageId);
    if (!message || message.conversation_id !== dto.conversationId) {
      throw new NotFoundException('Tin nhắn không tồn tại');
    }

    await this.chatRepo.updateLastRead(dto.conversationId, userId, dto.messageId);
  }

  // =========================================================================
  // HIDE — chỉ ảnh hưởng người gọi, không ảnh hưởng bên kia
  // =========================================================================

  async setHidden(userId: number, dto: SetHiddenDto): Promise<ParticipantStatusView> {
    const participant = await this.chatRepo.findParticipant(dto.conversationId, userId);
    if (!participant) {
      throw new ForbiddenException('Bạn không thuộc cuộc trò chuyện này');
    }

    const updated = await this.chatRepo.setHidden(dto.conversationId, userId, dto.hidden);
    return ChatMapper.toParticipantStatusView(updated!);
  }

  // =========================================================================
  // BLOCK
  // =========================================================================

  async setBlocked(userId: number, dto: SetBlockedDto): Promise<ParticipantStatusView> {
    const participant = await this.chatRepo.findParticipant(dto.conversationId, userId);
    if (!participant) {
      throw new ForbiddenException('Bạn không thuộc cuộc trò chuyện này');
    }

    const updated = await this.chatRepo.setBlocked(dto.conversationId, userId, dto.blocked);
    return ChatMapper.toParticipantStatusView(updated!);
  }
}