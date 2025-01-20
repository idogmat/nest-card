import { Blog } from "src/features/content/blogs/domain/blog.entity";

export class BlogOutputSAModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  blogOwnerInfo: {
    userId: string;
    userLogin: string;
  } | null;
  banInfo: {
    isBanned: boolean,
    banDate: string;
  } | null;
}

// MAPPERS

export const BlogOutputSAModelMapper = (blog: Blog): BlogOutputSAModel => {
  const outputModel = new BlogOutputSAModel();
  console.log(blog.user);
  outputModel.id = blog.id;
  outputModel.name = blog.name;
  outputModel.description = blog.description;
  outputModel.websiteUrl = blog.websiteUrl;
  outputModel.isMembership = blog.isMembership;
  outputModel.createdAt = new Date(blog.createdAt).toISOString();
  blog.user?.id ? outputModel.blogOwnerInfo = {
    userId: blog.user?.id,
    userLogin: blog.user?.login
  } : null;
  blog.bannedByAdmin !== null ? outputModel.banInfo = {
    isBanned: Boolean(blog.bannedByAdmin),
    banDate: blog.banDate ? new Date(blog.banDate).toISOString() : null
  } : null;

  return outputModel;
};