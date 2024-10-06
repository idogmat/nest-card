import { IsEmail, IsString, Length, Validate } from "class-validator";

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

export class EmailRecovery {

  @IsEmail()
  email: string;

}

export class SetNewPassword {

  @IsString()
  newPassword: string;

  @IsString()
  recoveryCode: string;

}

export class ConfirmCode {

  @IsString()
  code: string;

}