import { blogImagesMapper, BlogImagesOutputModel } from "src/features/content/images/api/model/output.blog-image";
import { Blog } from "../../../domain/blog.entity";
import { ApiProperty } from "@nestjs/swagger";

export class BlogSAOutputModel {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  name: string;
  @ApiProperty({ type: String })
  description: string;
  @ApiProperty({ type: String })
  websiteUrl: string;
  @ApiProperty({ type: String })
  createdAt: string;
  @ApiProperty({ type: Boolean })
  isMembership: boolean;
  @ApiProperty({ type: [BlogImagesOutputModel], description: 'Upload images' })
  images: BlogImagesOutputModel | []
}

export class BlogOutputModel {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  name: string;
  @ApiProperty({ type: String })
  description: string;
  @ApiProperty({ type: String })
  websiteUrl: string;
  @ApiProperty({ type: String })
  createdAt: string;
  @ApiProperty({ type: Boolean })
  isMembership: boolean;
  @ApiProperty({ type: [BlogImagesOutputModel], description: 'Upload images' })
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
