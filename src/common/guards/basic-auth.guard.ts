import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { AppSettings } from 'src/settings/app-settings';

// Custom guard
// https://docs.nestjs.com/guards
@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private appSettings: AppSettings) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    try {
      const authorization = request.headers?.authorization;

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

      const CREDENTIALS = `${this.appSettings.api.ADMIN_LOGIN}:${this.appSettings.api.ADMIN_PASSWORD}`;

      if (bytes !== CREDENTIALS) {
        throw new UnauthorizedException();
      }

      return true;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}