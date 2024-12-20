import { CommentLike } from "src/features/likes/domain/comment-like-info.entity";
import { LikeType } from "src/features/likes/domain/post-like-info.entity";

export class CommentByUserOutputModel {

  id: string;
  content: string;
  commentatorInfo: {
    userId: string,
    userLogin: string;
  };
  createdAt: string;
  likesInfo: {
    likesCount: number,
    dislikesCount: number,
    myStatus: string;
  };
  postInfo: {
    id: string,
    title: string,
    blogId: string,
    blogName: string;
  };

}
// MAPPERS

export const CommentByUserOutputModelMapper = (comment: any, _userId: string): CommentByUserOutputModel => {
  const outputModel = new CommentByUserOutputModel();
  outputModel.id = comment.id;
  outputModel.content = comment.content;
  outputModel.commentatorInfo = {
    userId: comment.userId,
    userLogin: comment.userLogin
  };
  outputModel.likesInfo = {
    likesCount: getLikeCount(comment?.extendedLikesInfo, 'Like') || 0,
    dislikesCount: getLikeCount(comment?.extendedLikesInfo, 'Dislike') || 0,
    myStatus: getCurrentStatus(comment?.extendedLikesInfo, _userId),
  };
  outputModel.createdAt = new Date(comment.createdAt).toISOString();
  // outputModel.postInfo = {
  //   id: comment.postId,
  //   title: comment.postTitle,
  //   blogId: comment.blogId,
  //   blogName: comment.blogName
  // };
  // outputModel.login = block.login;
  // outputModel.banInfo = {
  //   isBanned: !!block.banReason,
  //   banDate: new Date(block.createdAt).toISOString(),
  //   banReason: block.banReason,
  // };

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