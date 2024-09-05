import { IsString, Length } from "class-validator";

export class CommentCreateModel {

  @IsString()
  @Length(20, 300)
  content: string;
}
