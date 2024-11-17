import { IsString, IsUrl, Length } from "class-validator";
import { Trim } from "src/utils/decorators/transform/trim";

export class BlogCreateModel {
  @IsString()
  @Trim()
  @Length(1, 15)
  name: string;

  @IsString()
  @Trim()
  @Length(1, 500)
  description: string;

  @IsString()
  @Trim()
  @IsUrl()
  @Length(1, 100)
  websiteUrl: string;
}
