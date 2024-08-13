import { LikesInfo, LikeType } from "src/base/models/like-info.base";
import { PostDocument } from "src/features/posts/domain/post.entity";


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

export const PostOutputModelMapper = (post: PostDocument): PostOutputModel => {
  const outputModel = new PostOutputModel();

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
    myStatus: 'None',
    newestLikes: post.extendedLikesInfo?.newestLikes?.length
      ? post.extendedLikesInfo?.newestLikes?.filter((e, i) => i < 3)
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

export const getCurrentStatus = (map: Map<string, string>, userId: string) => {
  console.log(map.get(userId));
  return map.get(userId) || "None";
};