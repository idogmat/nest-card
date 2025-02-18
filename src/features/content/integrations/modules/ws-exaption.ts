import { ArgumentsHost, Injectable } from "@nestjs/common";
import { BaseWsExceptionFilter, WsException, } from "@nestjs/websockets";
import { Socket } from 'socket.io';

@Injectable()
export class WsExaptionFilter extends BaseWsExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost): void {
    const ctx = host.switchToWs()
    const client: Socket = ctx.getClient()
    client.emit('error', {
      type: exception.name,
      timestamp: new Date(),
      message: exception.getError()
    })
  }
}