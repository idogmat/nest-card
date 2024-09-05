import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema()
export class Blog {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true })
  websiteUrl: string;

  @Prop({ type: Number, default: new Date().getTime() })
  createdAt: number;

  @Prop({ type: Boolean, default: false })
  isMembership: boolean;

  static createBlog(name: string, description: string, websiteUrl: string) {
    const blog = new this();

    blog.name = name;
    blog.description = description;
    blog.websiteUrl = websiteUrl;
    blog.createdAt = new Date().getTime();
    blog.isMembership = false;

    return blog;
  }


}

export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.loadClass(Blog);

// Types
export type BlogDocument = HydratedDocument<Blog>;

// type BlogModelStaticType = {
//   createUser: (name: string, description: string, websiteUrl: string) => BlogDocument;
// };

export type BlogModelType = Model<BlogDocument>; //& UserModelStaticType;
