import { Injectable, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { MessageView } from './types';

interface JwtPayload {
  sub: number;
  email: string;
  roleId: number;
  studentId?: number;
  companyId?: number;
}

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: '*' },
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

  // =========================================================================
  // ROOM HELPERS
  // =========================================================================

  private userRoom(userId: number) {
    return `chat:user_${userId}`;
  }

  private conversationRoom(conversationId: number) {
    return `chat:conv_${conversationId}`;
  }

  // =========================================================================
  // AUTH HELPERS
  // =========================================================================

  private extractToken(client: Socket): string | null {
    const auth = client.handshake.auth?.token as string | undefined;
    if (!auth) return null;
    return auth.startsWith('Bearer ') ? auth.split(' ')[1] : auth;
  }

  private getPayload(client: Socket): JwtPayload | null {
    try {
      const token = this.extractToken(client);
      if (!token) return null;
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      return null;
    }
  }

  // =========================================================================
  // BROADCAST — chỉ được gọi từ Controller sau khi DB xong
  // Gateway không tự gọi Service ở đây, tránh duplicate logic
  // =========================================================================

  broadcastMessage(
    senderId: number,
    recipientUserIds: number[],
    conversationId: number,
    message: MessageView,
  ) {
    // 1. Gửi xác nhận cho người gửi qua userRoom của họ
    this.server.to(this.userRoom(senderId)).emit('message_sent', message);

    // 2. Gửi tin nhắn mới cho những người nhận qua userRoom của họ
    for (const recipientId of recipientUserIds) {
      this.server.to(this.userRoom(recipientId)).emit('new_message', message);
    }

    // ĐÃ XÓA: Gửi vào conversationRoom để tránh lỗi client nhận đúp tin nhắn
  }

  broadcastReadReceipt(
    userId: number,
    conversationId: number,
    lastReadMessageId: number,
  ) {
    this.server.to(this.conversationRoom(conversationId)).emit('read_receipt', {
      userId,
      conversationId,
      lastReadMessageId,
    });
  }

  broadcastBlocked(
    actorId: number,
    targetUserId: number,
    conversationId: number,
    blocked: boolean,
    result: any,
  ) {
    this.server.to(this.userRoom(actorId)).emit('blocked_updated', result);

    this.server
      .to(this.userRoom(targetUserId))
      .emit(blocked ? 'you_were_blocked' : 'you_were_unblocked', {
        conversationId,
        blockedBy: actorId,
      });
  }

  broadcastHidden(userId: number, result: any) {
    this.server.to(this.userRoom(userId)).emit('hidden_updated', result);
  }

  // =========================================================================
  // CONNECTION
  // =========================================================================

  handleConnection(client: Socket) {
    const payload = this.getPayload(client);
    if (!payload) {
      this.logger.warn(`[Chat] Rejected socket ${client.id}: no/invalid token`);
      client.disconnect();
      return;
    }

    const userId = payload.sub;
    client.data.userId = userId;
    client.data.roleId = payload.roleId;
    if (payload.studentId) client.data.studentId = payload.studentId;
    if (payload.companyId) client.data.companyId = payload.companyId;

    client.join(this.userRoom(userId));
    this.logger.log(`[Chat] User ${userId} connected | Socket: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`[Chat] Socket disconnected: ${client.id}`);
  }

  // =========================================================================
  // CONVERSATION
  // =========================================================================

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @MessageBody() payload: { conversationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const userId: number = client.data.userId;
    const { conversationId } = payload;

    const allowed = await this.chatService['chatRepo'].isParticipant(
      conversationId,
      userId,
    );
    if (!allowed) {
      client.emit('error', { message: 'Forbidden' });
      return;
    }

    client.join(this.conversationRoom(conversationId));
    client.emit('joined_conversation', { conversationId });
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @MessageBody() payload: { conversationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(this.conversationRoom(payload.conversationId));
  }

  // =========================================================================
  // SEND MESSAGE — chỉ cho text thuần, không có file
  // Gửi kèm ảnh → dùng POST /chat/message để upload Cloudinary trước
  // =========================================================================

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() payload: { conversationId: number; content?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId: number = client.data.userId;
    try {
      const { message, recipientUserIds } = await this.chatService.sendMessage(
        payload.conversationId,
        senderId,
        payload.content,
        [],
      );

      this.broadcastMessage(
        senderId,
        recipientUserIds,
        payload.conversationId,
        message,
      );
    } catch (err: any) {
      client.emit('error', { message: err.message });
    }
  }

  // =========================================================================
  // TYPING INDICATOR — pure real-time, không cần DB
  // =========================================================================

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @MessageBody() payload: { conversationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client
      .to(this.conversationRoom(payload.conversationId))
      .emit('user_typing', { userId: client.data.userId, isTyping: true });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @MessageBody() payload: { conversationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client
      .to(this.conversationRoom(payload.conversationId))
      .emit('user_typing', { userId: client.data.userId, isTyping: false });
  }

  // =========================================================================
  // UTILITY
  // =========================================================================

  sendToUser(userId: number, event: string, data: any) {
    this.server.to(this.userRoom(userId)).emit(event, data);
  }
}
