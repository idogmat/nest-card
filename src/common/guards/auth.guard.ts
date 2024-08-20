import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from "express";
import { UsersService } from "../../features/users/application/users.service";
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// Custom guard
// https://docs.nestjs.com/guards
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    console.log(this.usersService);
    console.log(request.headers.authorization);
    if (!request.headers.authorization) {
      // Если нужно выкинуть custom ошибку с кодом 401
      throw new UnauthorizedException();
    }

    const token = request.headers.authorization.split(" ");
    console.log(token[1]);
    console.log(this.configService.get('ACCESS_SECRET_TOKEN'));
    const res = await this.jwtService.verify(token[1], { secret: this.configService.get('ACCESS_SECRET_TOKEN') });
    console.log(res);
    // // example - Basic
    // const firstTokenPart = encodeString[0];
    // // example - YWRtaW46cXdlcnR5
    // const secondTokenPart = encodeString[1];

    return true;
  }
}
