import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { Like, LikeSchema } from 'src/features/likes/domain/like-info.entity';

@Schema()
export class Comment {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: Number, default: new Date().getTime() })
  createdAt: number;

  @Prop({ type: String })
  userId: string;

  @Prop({ type: String })
  userLogin: string;

  @Prop({ type: Like, default: {}, schema: LikeSchema })
  extendedLikesInfo: Like;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.loadClass(Comment);

// Types
export type CommentDocument = HydratedDocument<Comment>;

export type CommentModelType = Model<CommentDocument>;
