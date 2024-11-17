import { IsArray, IsString, Length } from "class-validator";
import { Trim } from "src/utils/decorators/transform/trim";

export class QuestionInputModel {
  @IsString()
  @Trim()
  @Length(10, 500)
  body: string;

  @IsArray()
  correctAnswers: string[];
}
