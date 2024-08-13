import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { Like, LikeSchema } from 'src/base/models/like-info.base';

@Schema()
export class Post {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, required: true })
  shortDescription: string;

  @Prop({ type: String, required: true })
  blogName: string;

  @Prop({ type: String, required: true })
  blogId: string;

  @Prop({ type: Number, default: new Date().getTime() })
  createdAt: number;

  @Prop({ type: Like, default: {}, schema: LikeSchema })
  extendedLikesInfo: Like;

}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.loadClass(Post);

// Types
export type PostDocument = HydratedDocument<Post>;

// type PostModelStaticType = {
//   createUser: (name: string, description: string, websiteUrl: string) => PostDocument;
// };

export type PostModelType = Model<PostDocument>; //& UserModelStaticType;
