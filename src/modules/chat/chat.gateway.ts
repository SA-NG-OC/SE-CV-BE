import { Injectable, Logger } from "@nestjs/common";
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
import { JwtService } from "@nestjs/jwt";
import { ChatService } from "./chat.service";

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
        private readonly chatService: ChatService
    ) { }

    // HELPER
    private extractToken(client: Socket): string | null {
        const auth = client.handshake.auth?.token as string | undefined;
        if (!auth) {
            return null;
        }
        return auth.startsWith('Bear ') ? auth.split(' ')[1] : auth;
    }

    private getPayload(client: Socket): JwtPayload | null {
        try {
            const token = this.extractToken(client);
            if (!token) {
                return null;
            }
            return this.jwtService.verify<JwtPayload>(token);
        }
        catch {
            return null;
        }
    }

    private userRoom(userId: number) {
        return `chat: user_${userId}`;
    }

    private conversationRoom(conversationId: number) {
        return `chat:conv_${conversationId}`;
    }

    // CONNECTION   
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

    //CONVERSATION
    @SubscribeMessage('join_conversation')
    async handleJoinConversation(
        @MessageBody() payload: { conversationId: number },
        @ConnectedSocket() client: Socket,
    ) {
        const userId = client.data.userId;
        const { conversationId } = payload;

        const allowed = await this.chatService['chatRepo'].isParticipant(conversationId, userId);

        if (!allowed) {
            client.emit('error', { message: 'Forbideen' });
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

    //SEND MESSAGE
    @SubscribeMessage('send_message')
    async handleSendMessage(
        @MessageBody() payload: { conversationId: number; content: string },
        @ConnectedSocket() client: Socket,
    ) {
        const senderId: number = client.data.userId;
        try {
            const { message, recipientUserIds } = await this.chatService.sendMessage(
                payload.conversationId,
                senderId,
                payload.content,
            );

            client.emit('message_sent', message);

            for (const recipientId of recipientUserIds) {
                this.server
                    .to(this.userRoom(recipientId))
                    .emit('new_message', message);
            }

            this.server
                .to(this.conversationRoom(payload.conversationId))
                .emit('new_message', message);
        } catch (err: any) {
            client.emit('error', { message: err.message });
        }
    }

    // TYPING INDICATOR
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
        @ConnectedSocket() client: Socket
    ) {
        client
            .to(this.conversationRoom(payload.conversationId))
            .emit('user_typing', { userId: client.data.userId, isTyping: false });
    }

    // MARK READ
    @SubscribeMessage('mark_read')
    async handleMarkRead(
        @MessageBody() payload: { conversationId: number; messageId: number },
        @ConnectedSocket() client: Socket,
    ) {
        const userId: number = client.data.userId;
        try {
            await this.chatService.markRead(userId, {
                conversationId: payload.conversationId,
                messageId: payload.messageId,
            });

            this.server
                .to(this.conversationRoom(payload.conversationId))
                .emit('read_receipt', {
                    userId,
                    conversationId: payload.conversationId,
                    lastReadMessageId: payload.messageId,
                });
        } catch (err: any) {
            client.emit('error', { message: err.message });
        }
    }

    sendToUser(userId: number, event: string, data: any) {
        this.server.to(this.userRoom(userId)).emit(event, data);
    }

    // BLOCK/ HIDE
    @SubscribeMessage('set_hidden')
    async handleSetHidden(
        @MessageBody() payload: { conversationId: number; hidden: boolean },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const result = await this.chatService.setHidden(client.data.userId, payload);
            client.emit('hidden_updated', result);
        } catch (err: any) {
            client.emit('error', { message: err.message });
        }
    }

    @SubscribeMessage('set_blocked')
    async handleSetBlocked(
        @MessageBody() payload: { conversationId: number; blocked: boolean },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const result = await this.chatService.setBlocked(client.data.userId, payload);
            client.emit('blocked_updated', result);
        } catch (err: any) {
            client.emit('error', { message: err.message });
        }
    }

}
