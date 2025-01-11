import { blogImagesMapper, BlogImagesOutputModel } from "src/features/content/images/api/model/output.blog-image";
import { Blog } from "../../../domain/blog.entity";

export class BlogSAOutputModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  images: BlogImagesOutputModel | []
}

export class BlogOutputModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  images: BlogImagesOutputModel | []
}


// MAPPERS

export const BlogOutputModelMapper = (blog: Blog): BlogOutputModel => {
  const outputModel = new BlogOutputModel();
  outputModel.id = blog.id;
  outputModel.name = blog.name;
  outputModel.description = blog.description;
  outputModel.websiteUrl = blog.websiteUrl;
  outputModel.isMembership = blog.isMembership;
  outputModel.createdAt = new Date(blog.createdAt).toISOString();
  outputModel.images = blogImagesMapper(blog.images)


  return outputModel;
};
