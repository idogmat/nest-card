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

export const PostOutputModelMapper = (post: PostDocument, userId?: string): PostOutputModel => {
  const outputModel = new PostOutputModel();
  console.log(post.extendedLikesInfo.newestLikes);
  outputModel.id = post.id;
  outputModel.title = post.title;
  outputModel.shortDescription = post.shortDescription;
  outputModel.content = post.content;
  outputModel.blogId = post.blogId;
  outputModel.blogName = post.blogName;
  outputModel.createdAt = new Date(post.createdAt).toISOString();
  outputModel.extendedLikesInfo = {
    likesCount: getLikeCount(post.extendedLikesInfo?.additionalLikes, 'Like') || 0,
    dislikesCount: getLikeCount(post.extendedLikesInfo?.additionalLikes, 'Dislike') || 0,
    myStatus: getCurrentStatus(post.extendedLikesInfo?.additionalLikes, userId),
    newestLikes: post.extendedLikesInfo?.newestLikes?.length
      ? post.extendedLikesInfo?.newestLikes?.filter((_, i) => i < 3)
      : [],
  };
  outputModel.blogId = post.blogId;
  outputModel.createdAt = new Date(post.createdAt).toISOString();

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