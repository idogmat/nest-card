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
  const extendedLikesInfo = post.extendedLikesInfo?.filter(e => !!e.userId) || [];
  console.log(post?.extendedLikesInfo);
  outputModel.id = post.id;
  outputModel.title = post.title;
  outputModel.shortDescription = post.shortDescription;
  outputModel.content = post.content;
  outputModel.blogId = post.blogId;
  outputModel.blogName = post.blogName;
  outputModel.createdAt = new Date(post.createdAt).toISOString();
  outputModel.extendedLikesInfo = {
    likesCount: extendedLikesInfo?.length ? getLikeCount(extendedLikesInfo, 'Like') : 0,
    dislikesCount: extendedLikesInfo?.length ? getLikeCount(extendedLikesInfo, 'Dislike') : 0,
    myStatus: extendedLikesInfo?.length ? getCurrentStatus(extendedLikesInfo, _userId) : "None",
    newestLikes: extendedLikesInfo?.length ? extendedLikesInfo?.map(e => {
      if (e.like === 'Like') {
        return ({ addedAt: new Date(e.addedAt).toISOString(), login: e.login, userId: e.userId });
      }
    })?.filter((_, i) => (i < 3 && _?.addedAt))
      : [],
  };

  return outputModel;
};

export const getLikeCount = (
  arr: { like: LikeType; userId: string; login: string; addedAt: number; }[],
  type: LikeType
): number => {
  let count = 0;
  if (!arr || !arr?.length) return count;
  arr.forEach((like) => {
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