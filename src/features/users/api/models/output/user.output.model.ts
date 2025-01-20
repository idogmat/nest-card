import { User } from "./../../../../../features/users/domain/user.entity";

export class UserOutputModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  banInfo: {
    isBanned: boolean;
    banDate: string;
    banReason: string;
  } | null;
}

// MAPPERS

export const UserOutputModelMapper = (user: User): UserOutputModel => {
  const outputModel = new UserOutputModel();

  outputModel.id = user.id;
  outputModel.login = user.login;
  outputModel.email = user.email;
  outputModel.createdAt = new Date(user.createdAt).toISOString();
  outputModel.banInfo = {
    isBanned: user.banned,
    banDate: user?.banDate ? new Date(user?.banDate).toISOString() : null,
    banReason: user.banReason || null,
  };
  return outputModel;
};
