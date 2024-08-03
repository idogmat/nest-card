import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {Observable} from 'rxjs';
import {Request} from "express";
import {UsersService} from "../../features/users/application/users.service";

// Custom guard
// https://docs.nestjs.com/guards
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly usersService: UsersService) {
    }


    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest<Request>();

        console.log(this.usersService);

        if (request.query['token'] !== '123') {
            // Если нужно выкинуть custom ошибку с кодом 401
            // throw new UnauthorizedException();

            // default error 403
            return false;
        }

        return true;
    }
}
