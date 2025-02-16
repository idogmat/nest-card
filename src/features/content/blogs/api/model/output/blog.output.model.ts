import { SubscribeStatus } from "src/features/content/integrations/domain/integration.entity";
import { blogImagesMapper, BlogImagesOutputModel } from "../../../../../../features/content/images/api/model/output.blog-image";
import { Blog } from "../../../domain/blog.entity";
import { ApiProperty } from "@nestjs/swagger";
export class Subscribe {
  currentUserSubscriptionStatus: 'Subscribed' | 'Unsubscribed'
}
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
  @ApiProperty({ type: Number, description: 'subscribers Count' })
  subscribersCount: number
  @ApiProperty({ type: String, description: 'Current User Subscription Status' })
  currentUserSubscriptionStatus: string
}


// MAPPERS

export const BlogOutputModelMapper = (blog: Blog, _id?: string): BlogOutputModel => {

  const outputModel = new BlogOutputModel();
  outputModel.id = blog.id;
  outputModel.name = blog.name;
  outputModel.description = blog.description;
  outputModel.websiteUrl = blog.websiteUrl;
  outputModel.isMembership = blog.isMembership;
  outputModel.createdAt = new Date(blog.createdAt).toISOString();
  outputModel.images = blogImagesMapper(blog.images)

  outputModel.subscribersCount = blog.subscribers?.filter(s => s.status === SubscribeStatus.Subscribed).length || 0
  const subscribe = blog.subscribers.find(s => s.userId === _id)?.status || "None"
  outputModel.currentUserSubscriptionStatus = subscribe


  return outputModel;
};
