import { LikeType } from "src/base/models/like-info.base";
import { CommentDocument } from "src/features/comments/domain/comment.entity";

export class CommentOutputModel {
  id: string;
  content: string;
  commentatorInfo?: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeType;
  };
}

// MAPPERS

export const CommentOutputModelMapper = (comment: CommentDocument): CommentOutputModel => {
  const outputModel = new CommentOutputModel();

  outputModel.id = comment.id;
  outputModel.content = comment.content;
  outputModel.commentatorInfo = comment?.commentatorInfo;
  outputModel.likesInfo.likesCount = 0;
  outputModel.likesInfo.dislikesCount = 0;
  outputModel.likesInfo.myStatus = 'None';
  // outputModel.likesInfo.likesCount = comment.extendedLikesInfo.additionalLikes;
  // outputModel.likesInfo.dislikesCount = comment.extendedLikesInfo.additionalLikes;
  // outputModel.likesInfo.myStatus = comment.extendedLikesInfo.additionalLikes;
  outputModel.createdAt = comment.createdAt.toISOString();

  return outputModel;
};
