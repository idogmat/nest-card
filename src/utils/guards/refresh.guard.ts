import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from "express";
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DevicesService } from 'src/features/devices/application/devices.service';

// Custom guard
// https://docs.nestjs.com/guards
@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(
    private readonly devicesService: DevicesService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (!request.cookies?.refreshToken) throw new UnauthorizedException();
    const token = request.cookies?.refreshToken;
    let res: any = undefined;
    try {
      res = await this.jwtService.verify(token, { secret: this.configService.get('REFRESH_SECRET_TOKEN') });
      const device = await this.devicesService.getById(res.deviceId);
      if (device.lastActiveDate.getTime() != new Date(res.lastActiveDate).getTime()) throw new UnauthorizedException();
    } catch {
      throw new UnauthorizedException();
    }
    request.user = res;
    return true;
  }
}
