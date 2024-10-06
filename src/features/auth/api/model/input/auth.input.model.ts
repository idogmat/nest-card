import { IsEmail, IsString, Length, Validate } from "class-validator";
import CustomCodeExistValidation from "src/common/decorators/validate/custom-ode-exist-validation";
import CustomEmailExistValidation from "src/common/decorators/validate/custom-email-exist-validation";
import CustomEmailValidation from "src/common/decorators/validate/custom-email-validation";
import CustomLoginValidation from "src/common/decorators/validate/custom-login-validation";

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
  @Validate(CustomCodeExistValidation)
  code: string;

}