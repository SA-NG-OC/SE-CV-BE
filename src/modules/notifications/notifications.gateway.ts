import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface JwtPayload {
  sub: number;
  email: string;
  roleId: number;
  studentId?: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  constructor(private readonly jwtService: JwtService) { }

  private extractToken(client: Socket): string | null {
    const authHeader = client.handshake.auth?.token;
    if (!authHeader) {
      return null;
    }
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
    return authHeader;
  }

  private getUserRoom(userId: number): string {
    return `user_${userId}`;
  }

  handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        return new Error('No token');
      }
      const payload = this.jwtService.verify<JwtPayload>(token);
      const userId = payload.sub;
      const room = this.getUserRoom(userId);
      client.join(room);
      this.logger.log(
        `User ${userId} connected | Socket: ${client.id} | Room: ${room}`,
      );
    }
    catch (err: any) {
      this.logger.warn(
        `Socket connection rejected: ${client.id} | Reason: ${err.message}`,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  //Send to user
  sendToUser(userId: number, event: string, data: any) {
    const room = this.getUserRoom(userId);
    this.server.to(room).emit(event, data);
  }
  //Send to many users
  sendToUsers(userIds: number[], event: string, data: any) {
    const rooms = userIds.map((id) => this.getUserRoom(id));

    this.server.to(rooms).emit(event, data);
  }

  @SubscribeMessage('send_message')
  handleMessage(
    @MessageBody() payload: { content: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`Message received from ${client.id}`, payload)
    this.server.emit('receive_message', {
      senderId: client.id,
      content: payload.content,
      timestamp: new Date().toISOString(),
    });
  }
}
