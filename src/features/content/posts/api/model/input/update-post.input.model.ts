import { IsString, Length, Validate } from "class-validator";
import { Trim } from "src/utils/decorators/transform/trim";
import { CustomBlogIdValidation } from "../../../validate/blogId.validate";

export class PostUpdateModel {
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

  @IsString()
  @Validate(CustomBlogIdValidation)
  blogId: string;
}