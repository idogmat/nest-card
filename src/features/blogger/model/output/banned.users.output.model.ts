
export class BanndedUserOutputModel {

  id: string;
  login: string;
  createdAt: Date;
  banInfo: {
    isBanned: boolean;
    banDate: string;
    banReason: string;
  };
}
// MAPPERS

export const BanndedUserOutputModelMapper = (block: any): BanndedUserOutputModel => {
  const outputModel = new BanndedUserOutputModel();
  outputModel.id = block.blockedByUserId;
  outputModel.login = block.login;
  outputModel.banInfo = {
    isBanned: !!block.banReason,
    banDate: new Date(block.createdAt).toISOString(),
    banReason: block.banReason,
  };

  return outputModel;
};
