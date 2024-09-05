import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from "express";
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGetGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (!request.headers?.authorization) return true;
    const token = request.headers?.authorization?.split(" ");
    let res: any = undefined;
    try {
      res = await this.jwtService.verify(token[1], { secret: this.configService.get('ACCESS_SECRET_TOKEN') });
    } catch {

    }
    request.user = res;
    return true;
  }
}
