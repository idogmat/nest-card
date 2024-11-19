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
  };
}

// MAPPERS

export const BlogOutputSAModelMapper = (blog: Blog): BlogOutputSAModel => {
  const outputModel = new BlogOutputSAModel();
  outputModel.id = blog.id;
  outputModel.name = blog.name;
  outputModel.description = blog.description;
  outputModel.websiteUrl = blog.websiteUrl;
  outputModel.isMembership = blog.isMembership;
  outputModel.createdAt = new Date(blog.createdAt).toISOString();
  outputModel.blogOwnerInfo = {
    userId: blog.user.id,
    userLogin: blog.user.login
  };

  return outputModel;
};