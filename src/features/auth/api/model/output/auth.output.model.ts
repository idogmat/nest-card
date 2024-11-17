import { UserPg } from "./../../../../../features/users/domain/user.entity";

export class AuthOutputModel {
  accessToken: string;
}

export class AuthMeOutputModel {
  login: string;
  email: string;
  userId: string;
  constructor() { }
  static getAuthMe(user: UserPg) {
    return {
      login: user.login,
      email: user.email,
      userId: user.id,
    };
  }
}