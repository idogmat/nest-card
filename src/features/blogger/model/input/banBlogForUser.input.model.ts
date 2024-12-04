import { IsBoolean, IsString, MinLength } from "class-validator";

export class BanUserForBlogInputModel {
  @IsBoolean()
  isBanned: boolean;

  @IsString()
  @MinLength(20)
  banReason: string;

  @IsString()
  blogId: string;
}

