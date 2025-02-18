import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsException, } from "@nestjs/websockets";
import { Socket } from 'socket.io';

@Injectable()
export class SocketAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService
  ) { }

  async canActivate(context: ExecutionContext): Promise<any> {
    const client: Socket = context.switchToWs().getClient()
    const token: string = client.handshake?.auth?.token as string || ''
    try {
      if (!token) throw new WsException('Missing token')
      const result = this.jwtService.decode(token)
      if (!result) throw new WsException('Unauthorized')
    } catch (error) {
      throw error
    }
    return true
  }
}