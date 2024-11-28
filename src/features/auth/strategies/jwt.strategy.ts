import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import env from 'dotenv';
import { UsersService } from "src/features/users/application/users.service";
env.config();
export const secret = process.env.ACCESS_SECRET_TOKEN || 'any';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersRepo: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }
  async validate(payload: any) {
    const user = await this.usersRepo.getById(payload.userId);
    if (user.banned) throw new NotFoundException();
    console.log(user);
    console.log(payload);
    return { userId: payload.userId, login: payload.login, deviceId: payload.deviceId };
  }
}