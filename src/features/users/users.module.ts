import { Module } from "@nestjs/common";
import { UsersService } from "./application/users.service";
import { UsersRepository } from "./infrastructure/users.repository";
import { UsersQueryRepository } from "./infrastructure/users.query-repository";
import { UsersController } from "./api/users.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./domain/user.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([User])
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, UsersQueryRepository],
  exports: [UsersRepository, UsersService]
})
export class UserModule { }