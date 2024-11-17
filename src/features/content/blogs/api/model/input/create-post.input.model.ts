import { IsString, Length } from "class-validator";
import { Trim } from "src/utils/decorators/transform/trim";

export class PostInBlogCreateModel {
  @IsString()
  @Trim()
  @Length(1, 30)
  title: string;

  @IsString()
  @Length(1, 100)
  shortDescription: string;

  @IsString()
  @Trim()
  @Length(1, 1000)
  content: string;
}