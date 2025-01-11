import { Post } from "../../../domain/post.entity";
import { LikesInfo, LikeType, PostLike } from "./../../../../../../features/likes/domain/post-like-info.entity";
import { postImagesMapper, PostImagesOutputModel } from "src/features/content/images/api/model/output.post-image";


export class PostOutputModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: LikesInfo;
  images: PostImagesOutputModel
}

// MAPPERS
// FIXME поправить мапинг
export const PostOutputModelMapper = (post: Post & { blogName: string; }, _userId?: string): PostOutputModel => {
  const outputModel = new PostOutputModel();
  outputModel.id = post?.id;
  outputModel.title = post?.title;
  outputModel.shortDescription = post?.shortDescription;
  outputModel.content = post?.content;
  outputModel.blogId = post?.blogId;
  outputModel.blogName = post?.blogName;
  outputModel.createdAt = new Date(+post?.createdAt).toISOString();
  outputModel.extendedLikesInfo = {
    likesCount: post?.extendedLikesInfo?.length ? getLikeCount(post?.extendedLikesInfo, 'Like') : 0,
    dislikesCount: post?.extendedLikesInfo?.length ? getLikeCount(post?.extendedLikesInfo, 'Dislike') : 0,
    myStatus: post?.extendedLikesInfo?.length ? getCurrentStatus(post?.extendedLikesInfo, _userId) : "None",
    newestLikes: post?.extendedLikesInfo?.length ? post?.extendedLikesInfo?.reduce((acc, e) => {
      if (e?.type === 'Like' && acc.length < 3) {
        acc.push({ addedAt: new Date(e?.addedAt).toISOString(), login: e?.login, userId: e?.userId });
      }
      return acc;
    }, [])
      : [],
  };
  outputModel.images = postImagesMapper(post.images)

  return outputModel;
};

export const getLikeCount = (
  arr: PostLike[],
  type: LikeType
): number => {
  let count = 0;
  if (!arr || !arr?.length) return count;
  arr.forEach((like) => {
    if (like.type === type) count++;
  });
  return count;
};

export const getCurrentStatus = (
  arr: PostLike[],
  userId: string
): LikeType => {
  if (!userId) return "None";
  return arr?.find(like => like.userId === userId)?.type || "None";
};