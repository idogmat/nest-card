import { IsEnum } from "class-validator";
import { LikeType } from "src/features/likes/domain/like-info.entity";

export class LikeSetOnPostModel {

  @IsEnum(["None", "Like", "Dislike"])
  likeStatus: LikeType;
}