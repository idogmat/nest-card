
export class UserOutputModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
}

export class UserDBModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
}

// MAPPERS

export const UserOutputModelMapper = (user: UserDBModel): UserOutputModel => {
  const outputModel = new UserOutputModel();

  outputModel.id = user.id;
  outputModel.login = user.login;
  outputModel.email = user.email;
  outputModel.createdAt = new Date(+user.createdAt).toISOString();

  return outputModel;
};
