import { Body, Controller, Get, Post, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BasicAuthGuard } from "src/common/guards/basic-auth.guard";
import { JwtAuthGuard } from "src/features/auth/guards/jwt-auth.guard";
import { UsersService } from "src/features/users/application/users.service";
import { QuestionInputModel } from "../model/input/question.input.model";
import { QuizService } from "../application/quiz.service";

@ApiTags('Quiz')
@Controller('')
export class QuizController {
  constructor(
    private readonly quizService: QuizService,
  ) { }

  // SA
  @UseGuards(BasicAuthGuard)
  @Post('/sa/quiz/questions')
  async createQuestion(@Body() createModel: QuestionInputModel) {
    const user = await this.quizService.createQuestion(createModel);
    if (!user) throw new UnauthorizedException();

    return user;
  }
}