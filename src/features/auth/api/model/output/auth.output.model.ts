import { IsEmail, IsString } from "class-validator";
import { UserDocument } from "src/features/users/domain/user.entity";

export class AuthOutputModel {
  accessToken: string;
}

export class AuthMeOutputModel {
  login: string;
  email: string;
  userId: string;
  constructor() { }
  static getAuthMe(user: UserDocument) {
    return {
      login: user.login,
      email: user.email,
      userId: user.id,
    };
  }
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