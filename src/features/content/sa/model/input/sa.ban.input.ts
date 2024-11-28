import { IsBoolean, IsString, MinLength } from "class-validator";

export class BanInputModel {
  @IsBoolean()
  isBanned: boolean;

  @IsString()
  @MinLength(20)
  banReason: string;

}