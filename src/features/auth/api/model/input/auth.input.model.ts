import { IsEmail, IsString, Length } from "class-validator";

export class LoginInputModel {
  @IsString()
  loginOrEmail: string;

  @IsString()
  password: string;
}

export class CreateUserModel {
  @IsString()
  @Length(3, 10)
  login: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 20)
  password: string;
}
