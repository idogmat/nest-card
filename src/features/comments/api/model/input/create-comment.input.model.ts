import { IsString, Length } from "class-validator";

export class CommentCreateModel {

  @IsString()
  @Length(3, 10)
  content: string;
}
