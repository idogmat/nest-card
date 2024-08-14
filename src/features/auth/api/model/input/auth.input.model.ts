import { IsEmail, IsString, Length, Validate } from "class-validator";
import { CustomCodeValidation, CustomEmailExistValidation, CustomEmailValidation, CustomLoginValidation } from "src/common/decorators/validate/is-email-or-login-exist";

export class LoginInputModel {
  @IsString()
  loginOrEmail: string;

  @IsString()
  password: string;
}

export class CreateUserModel {
  @IsString()
  @Length(3, 10)
  @Validate(CustomLoginValidation)
  login: string;

  @IsString()
  @IsEmail()
  @Validate(CustomEmailValidation)
  email: string;

  @IsString()
  @Length(6, 20)
  password: string;

}

export class EmailRecovery {

  @IsEmail()
  @Validate(CustomEmailExistValidation)
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
  @Validate(CustomCodeValidation)
  code: string;

}