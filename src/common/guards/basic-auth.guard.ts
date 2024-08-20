import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Observable } from 'rxjs';

// Custom guard
// https://docs.nestjs.com/guards
@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    try {
      const authorization = request.headers?.authorization;
      console.log(authorization);
      if (!authorization) {
        throw new UnauthorizedException();
      }

      // example - Basic YWRtaW46cXdlcnR5
      const encodeString = authorization.split(" ");

      // example - Basic
      const firstTokenPart = encodeString[0];
      // example - YWRtaW46cXdlcnR5
      const secondTokenPart = encodeString[1];


      if (firstTokenPart !== "Basic") {
        throw new UnauthorizedException();
      }


      const bytes = Buffer.from(secondTokenPart, 'base64').toString('utf8');

      const CREDENTIALS = `${this.configService.get('ADMIN_LOGIN')}:${this.configService.get('ADMIN_PASSWORD')}`;

      if (bytes !== CREDENTIALS) {
        throw new UnauthorizedException();
      }

      return true;
    } catch (_e: any) {
      throw new UnauthorizedException();
    }
  }
}