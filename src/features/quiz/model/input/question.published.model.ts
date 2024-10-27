import { IsBoolean } from "class-validator";

export class QuestionPublishedModel {

  @IsBoolean()
  published: boolean;
}
