import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from "express";
import { UsersService } from "../../features/users/application/users.service";
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// Custom guard
// https://docs.nestjs.com/guards
@Injectable()
export class AuthGetGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (!request.headers?.authorization) return true;
    const token = request.headers?.authorization?.split(" ");
    const res = await this.jwtService.verify(token[1], { secret: this.configService.get('ACCESS_SECRET_TOKEN') });
    request.user = res;
    return true;
  }
}
