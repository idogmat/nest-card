import { LikesInfo, LikeType } from "src/features/likes/domain/like-info.entity";
import { PostDocument } from "../../../domain/post.entity";


export class PostOutputModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: LikesInfo;
}

// MAPPERS
// FIXME поправить мапинг
export const PostOutputModelMapper = (post: PostDocument, _userId?: string): PostOutputModel => {
  const outputModel = new PostOutputModel();
  console.log(post.extendedLikesInfo);
  outputModel.id = post.id;
  outputModel.title = post.title;
  outputModel.shortDescription = post.shortDescription;
  outputModel.content = post.content;
  outputModel.blogId = post.blogId;
  outputModel.blogName = post.blogName;
  outputModel.createdAt = new Date(+post.createdAt).toISOString();
  outputModel.extendedLikesInfo = {
    likesCount: getLikeCount(post?.extendedLikesInfo, 'Like') || 0,
    dislikesCount: getLikeCount(post?.extendedLikesInfo, 'Dislike') || 0,
    myStatus: getCurrentStatus(post.extendedLikesInfo, _userId),
    newestLikes: (post.extendedLikesInfo && post.extendedLikesInfo?.length)
      ? post.extendedLikesInfo?.sort((a, b) => b.addedAt - a.addedAt)?.filter((_, i) => i < 3)?.map(e => ({ addedAt: new Date(+e.addedAt).toISOString(), login: e.login, userId: e.userId }))
      : [],
  };
  console.log(post);

  return outputModel;
};

export const getLikeCount = (
  arr: { like: LikeType; userId: string; login: string; addedAt: number; }[],
  type: LikeType
): number => {
  let count = 0;
  if (!arr && !arr?.length) return count;
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