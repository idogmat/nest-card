import { CommentLikePg, LikeType } from "src/features/likes/domain/comment-like-info.entity";
import { CommentPg } from "../../../domain/comment.entity";

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

export const CommentOutputModelMapper = (comment: CommentPg, _userId?: string): CommentOutputModel => {
  const outputModel = new CommentOutputModel();
  const extendedLikesInfo = comment?.extendedLikesInfo?.filter(c => !!c.userId) || [];
  outputModel.id = comment.id;
  outputModel.content = comment.content;
  outputModel.commentatorInfo = {
    userId: comment.userId,
    userLogin: comment.userLogin
  },
    outputModel.likesInfo = {
      likesCount: getLikeCount(extendedLikesInfo, 'Like') || 0,
      dislikesCount: getLikeCount(extendedLikesInfo, 'Dislike') || 0,
      myStatus: getCurrentStatus(extendedLikesInfo, _userId),
      // likesCount: 0,
      // dislikesCount: 0,
      // myStatus: "None",
    };
  outputModel.createdAt = new Date(comment.createdAt).toISOString();

  return outputModel;
};

export const getLikeCount = (
  arr: CommentLikePg[],
  type: LikeType
): number => {
  let count = 0;
  if (!arr || !arr?.length) return count;
  arr?.forEach((like) => {
    if (like.type === type) count++;
  });
  return count;
};

export const getCurrentStatus = (
  arr: CommentLikePg[],
  userId: string
): LikeType => {
  if (!userId) return "None";
  return arr?.find(like => like.userId === userId)?.type || "None";
};