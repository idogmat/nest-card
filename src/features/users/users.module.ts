import { Module } from "@nestjs/common";
import { UsersService } from "./application/users.service";
import { UsersRepository } from "./infrastructure/users.repository";
import { UsersQueryRepository } from "./infrastructure/users.query-repository";
import { UsersController } from "./api/users.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./domain/user.entity";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, UsersQueryRepository],
  exports: [UsersRepository, UsersService]
})
export class UserModule { }