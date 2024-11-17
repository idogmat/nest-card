import { IsEnum } from "class-validator";
import { LikeType } from "./../../../../../features/likes/domain/post-like-info.entity";

export class LikeSetModel {

  @IsEnum(["None", "Like", "Dislike"])
  likeStatus: LikeType;
}