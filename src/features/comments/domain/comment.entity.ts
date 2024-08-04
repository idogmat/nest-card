import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { Like, LikeSchema } from 'src/base/models/like-info.base';

@Schema()
export class CommentatorInfo {
  @Prop({ type: String })
  userId: string;

  @Prop({ type: String })
  userLogin: string;
}

@Schema()
export class Comment {
  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: Date, default: new Date() })
  createdAt: Date;

  @Prop({ type: CommentatorInfo, default: {} })
  commentatorInfo: CommentatorInfo;

  @Prop({ type: Like, default: {}, schema: LikeSchema })
  extendedLikesInfo: Like;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.loadClass(Comment);

// Types
export type CommentDocument = HydratedDocument<Comment>;

export type CommentModelType = Model<CommentDocument>;
