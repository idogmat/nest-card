import { IsString, IsUrl, Length } from "class-validator";

export class BlogCreateModel {
  @IsString()
  @Length(1, 15)
  name: string;

  @IsString()
  @Length(1, 500)
  description: string;

  @IsString()
  @IsUrl()
  @Length(1, 100)
  websiteUrl: string;
}
