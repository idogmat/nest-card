import { IsString } from "class-validator";

export class WSData {
  @IsString()
  id: string;

  @IsString()
  text: string;

  @IsString()
  timestamp: Date;
}