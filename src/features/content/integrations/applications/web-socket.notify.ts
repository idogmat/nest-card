import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketAuthGuard } from '../guards/socket-auth-token-guarg';
import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { WSData } from '../model/ws-dto';
import { WSValidationPipe } from '../pipes/validation-ws';
import { WsExaptionFilter } from '../modules/ws-exaption';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/notify' })
export class WebsocketNotify implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  constructor() { }
  private clients = new Map<string, any>();

  handleConnection(client: Socket) {
    this.server.to(client.id).emit('notify', { message: 'connected' });
    // this.server.to(client.id).emit('event', { event: 'info' });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.clients.delete(client.id);
  }

  getClients() {
    return this.clients
  }

  @SubscribeMessage('btn')
  handleEvent(
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(client.id).emit('notify', { message: 'ok' });
  }

  @UseGuards(SocketAuthGuard)
  @UsePipes(WSValidationPipe)
  @UseFilters(new WsExaptionFilter())
  @SubscribeMessage('message')
  handleEventWithRepeat(
    @MessageBody() data: WSData,
    @ConnectedSocket() client: Socket
  ): void {
    this.server.to(client.id).emit('message', { ...data, text: `i got ${data.text}` });
  }

  sendToUser(userId: string, payload: any) {
    for (const [clientId, storedUserId] of this.clients.entries()) {
      if (storedUserId === userId) {
        this.server.to(clientId).emit('notification', payload);
        console.log(`📲 Sent event to user ${userId}:`, payload);
      }
    }
  }
}