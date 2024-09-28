import { LikeType } from "src/features/likes/domain/like-info.entity";
import { Comment } from "../../../domain/comment.entity";

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

export const CommentOutputModelMapper = (comment: Comment, _userId?: string): CommentOutputModel => {
  console.log(comment);
  const outputModel = new CommentOutputModel();
  outputModel.id = comment.id;
  outputModel.content = comment.content;
  outputModel.commentatorInfo = {
    userId: comment.userId,
    userLogin: comment.userLogin
  },
    outputModel.likesInfo = {
      likesCount: getLikeCount(comment.extendedLikesInfo, 'Like') || 0,
      dislikesCount: getLikeCount(comment.extendedLikesInfo, 'Dislike') || 0,
      myStatus: getCurrentStatus(comment.extendedLikesInfo, _userId),
      // likesCount: 0,
      // dislikesCount: 0,
      // myStatus: "None",
    };
  outputModel.createdAt = new Date(+comment.createdAt).toISOString();

  return outputModel;
};

export const getLikeCount = (
  arr: { like: LikeType; userId: string; login: string; addedAt: number; }[],
  type: LikeType
): number => {
  let count = 0;
  if (!arr || !arr?.length) return count;
  arr?.forEach((like) => {
    if (like.like === type) count++;
  });
  return count;
};

export const getCurrentStatus = (
  arr: { like: LikeType; userId: string; login: string; addedAt: number; }[],
  userId: string
): LikeType => {
  if (!userId) return "None";
  return arr?.find(like => like.userId === userId)?.like || "None";
};