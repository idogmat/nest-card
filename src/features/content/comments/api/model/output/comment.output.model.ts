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
      // likesCount: getLikeCount(comment.extendedLikesInfo?.additionalLikes, 'Like') || 0,
      // dislikesCount: getLikeCount(comment.extendedLikesInfo?.additionalLikes, 'Dislike') || 0,
      // myStatus: getCurrentStatus(comment.extendedLikesInfo?.additionalLikes, userId),
      likesCount: 0,
      dislikesCount: 0,
      myStatus: "None",
    };
  outputModel.createdAt = new Date(+comment.createdAt).toISOString();

  return outputModel;
};

export const getLikeCount = (map: Map<string, string>, type: LikeType) => {
  let count = 0;
  map?.forEach((like) => {
    if (like === type) count++;
  });
  return count;
};

export const getCurrentStatus = (map: Map<string, LikeType>, userId: string): LikeType => {
  if (!userId) return "None";
  return map?.get(userId) || "None";
};