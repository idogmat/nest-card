import { CommentLike, LikeType } from "./../../../../../../features/likes/domain/comment-like-info.entity";
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
  const outputModel = new CommentOutputModel();
  outputModel.id = comment.id;
  outputModel.content = comment.content;
  outputModel.commentatorInfo = {
    userId: comment.userId,
    userLogin: comment.userLogin
  },
    outputModel.likesInfo = {
      likesCount: getLikeCount(comment?.extendedLikesInfo, 'Like') || 0,
      dislikesCount: getLikeCount(comment?.extendedLikesInfo, 'Dislike') || 0,
      myStatus: getCurrentStatus(comment?.extendedLikesInfo, _userId),
    };
  outputModel.createdAt = new Date(comment.createdAt).toISOString();

  return outputModel;
};

export const getLikeCount = (
  arr: CommentLike[],
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
  arr: CommentLike[],
  userId: string
): LikeType => {
  if (!userId) return "None";
  return arr?.find(like => like.userId === userId)?.type || "None";
};