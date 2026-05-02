import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CHAT_REPOSITORY, type IChatRepository } from './repositories/chat-repository.interface';
import { ChatMapper } from './domain/chat.mapper';
import { GetMessagesDto, MarkReadDto, SetBlockedDto, SetHiddenDto } from './dto/chat.dto';
import { Role } from 'src/common/types/role.enum';
import { ConversationListItemView, MessageView, ParticipantStatusView } from './types';

@Injectable()
export class ChatService {
  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly chatRepo: IChatRepository,
  ) { }

  // =========================================================================
  // GET OR CREATE CONVERSATION
  // =========================================================================

  async getOrCreateConversation(
    companyId: number,
    studentId: number,
    companyUserId: number,
    studentUserId: number,
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
    await this.ensureParticipant(conversationId, companyUserId);
    await this.ensureParticipant(conversationId, studentUserId);

    return { conversationId, isNew };
  }

  private async ensureParticipant(conversationId: number, userId: number): Promise<void> {
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
  ): Promise<{ message: MessageView, recipientUserIds: number[] }> {
    const senderParticipant = await this.chatRepo.findParticipant(conversationId, senderId);
    if (!senderParticipant) {
      throw new ForbiddenException('Bạn không thuộc cuộc trò chuyện này');
    }

    const blocked = await this.chatRepo.hasAnyBlocked(conversationId);
    if (blocked) {
      throw new ForbiddenException('Không thể gửi tin nhắn vì cuộc trò chuyện đã bị chặn');
    }

    const trimmed = content.trim();
    if (!trimmed) throw new ForbiddenException('Nội dung tin nhắn không được để trống');

    const saved = await this.chatRepo.createMessage({
      conversation_id: conversationId,
      sender_id: senderId,
      content: trimmed,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await this.chatRepo.updateLastMessageAt(conversationId);

    const allUserIds = await this.chatRepo.getParticipantUserIds(conversationId);
    const recipientUserIds = allUserIds.filter((id) => id !== senderId);

    return {
      message: ChatMapper.toMessageView(saved, senderId),
      recipientUserIds: recipientUserIds
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