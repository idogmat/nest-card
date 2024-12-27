import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { Request } from "express";
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/features/users/application/users.service';

@Injectable()
export class AuthGetGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    // private readonly usersRepo: UsersService
  ) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (!request.headers?.authorization) return true;
    const token = request.headers?.authorization?.split(" ");
    console.log('check');
    let res: any = undefined;
    try {
      res = await this.jwtService.verify(token[1], { secret: this.configService.get('ACCESS_SECRET_TOKEN') });
    } catch {
      console.log('fail');
    }
    console.log(res);
    // const user = await this.usersRepo.getById(res.userId);
    // if (user.banned) throw new NotFoundException();
    // console.log(res, 'res');
    request.user = res;
    return true;
  }
}
