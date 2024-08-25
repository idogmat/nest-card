import { CommentDocument } from "src/features/comments/domain/comment.entity";
import { LikeType } from "src/features/likes/domain/like-info.entity";

export class CommentOutputModel {
  id: string;
  content: string;
  commentatorInfo: {
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

export const CommentOutputModelMapper = (comment: CommentDocument, userId?: string): CommentOutputModel => {
  const outputModel = new CommentOutputModel();

  outputModel.id = comment.id;
  outputModel.content = comment.content;
  outputModel.commentatorInfo = comment.commentatorInfo;
  outputModel.likesInfo = {
    likesCount: getLikeCount(comment.extendedLikesInfo?.additionalLikes, 'Like') || 0,
    dislikesCount: getLikeCount(comment.extendedLikesInfo?.additionalLikes, 'Dislike') || 0,
    myStatus: getCurrentStatus(comment.extendedLikesInfo?.additionalLikes, userId),
  };
  outputModel.createdAt = new Date(comment.createdAt).toISOString();

  return outputModel;
};

export const getLikeCount = (map: Map<string, string>, type: LikeType) => {
  let count = 0;
  map.forEach((like) => {
    if (like === type) count++;
  });
  return count;
};

export const getCurrentStatus = (map: Map<string, LikeType>, userId: string): LikeType => {
  console.log(map.get(userId));
  return map.get(userId) || "None";
};