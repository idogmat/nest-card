import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export type LikeType = 'None' | 'Like' | 'Dislike';

export interface LikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeType;
  newestLikes?: NewestLikes[];
}

@Schema()
export class NewestLikes {
  @Prop({ type: String })
  addedAt: string;

  @Prop({ type: String })
  userId: string;

  @Prop({ type: String })
  login: string;
}

@Schema()
export class Like {
  @Prop({ type: Map, of: String, default: {} })
  additionalLikes: Map<string, LikeType>;

  @Prop({ type: [], of: NewestLikes, default: [] })
  newestLikes?: NewestLikes[];
}

export const LikeSchema = SchemaFactory.createForClass(Like);

// Types
export type LikeDocument = HydratedDocument<Like>;

export type LikeModelType = Model<LikeDocument>; //& UserModelStaticType;
