import { BlogDocument } from "src/features/blogs/domain/blog.entity";

export class BlogOutputModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
}

// MAPPERS

export const BlogOutputModelMapper = (blog: BlogDocument): BlogOutputModel => {
  const outputModel = new BlogOutputModel();

  outputModel.id = blog.id;
  outputModel.name = blog.name;
  outputModel.description = blog.description;
  outputModel.websiteUrl = blog.websiteUrl;
  outputModel.isMembership = blog.isMembership;
  outputModel.createdAt = blog.createdAt.toISOString();

  return outputModel;
};
