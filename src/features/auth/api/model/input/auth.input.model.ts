import { IsEmail, IsString, Length, Validate } from "class-validator";
import { CustomCodeValidation } from "src/common/decorators/validate/is-code-validator";
import { CustomEmailExistValidation } from "src/common/decorators/validate/is-email-exist-validator";
import { CustomEmailValidation } from "src/common/decorators/validate/is-email-validator";
import { CustomLoginValidation } from "src/common/decorators/validate/is-login-validator";

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