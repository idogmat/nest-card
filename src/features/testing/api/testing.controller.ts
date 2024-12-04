import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

// Tag для swagger
@ApiTags('Testing')
@Controller('testing/all-data')
export class TestingController {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) { }

  @Delete()
  @HttpCode(204)
  async delete() {
    await this.dataSource.query(`TRUNCATE TABLE 
      "user",
      "device",
      "blog",
      "blog_block",
      "post",
      "post_like",
      "comment",
      "comment_like",
      "game",
      "player_progress",
      "question_of_the_game",
      "player_answer",
      "question"
       CASCADE`);
    // await this.dataSource.query(`TRUNCATE TABLE "device" CASCADE`);
    // await this.dataSource.query(`TRUNCATE TABLE "blog" CASCADE`);
    // await this.dataSource.query(`TRUNCATE TABLE "post" CASCADE`);
    // await this.dataSource.query(`TRUNCATE TABLE "post_like" CASCADE`);
    // await this.dataSource.query(`TRUNCATE TABLE "comment" CASCADE`);
    // await this.dataSource.query(`TRUNCATE TABLE "comment_like" CASCADE`);

    // await this.dataSource.query(`TRUNCATE TABLE "game" CASCADE`);
    // await this.dataSource.query(`TRUNCATE TABLE "player_progress" CASCADE`);
    // await this.dataSource.query(`TRUNCATE TABLE "question_of_the_game" CASCADE`);
    // await this.dataSource.query(`TRUNCATE TABLE "player_answer" CASCADE`);
    // await this.dataSource.query(`TRUNCATE TABLE "question" CASCADE`);
    return;
  }

  @Delete('/game')
  @HttpCode(204)
  async deleteGame() {
    await this.dataSource.query(`TRUNCATE TABLE game CASCADE`);
    await this.dataSource.query(`TRUNCATE TABLE player_progress CASCADE`);
    await this.dataSource.query(`TRUNCATE TABLE question_of_the_game CASCADE`);
    await this.dataSource.query(`TRUNCATE TABLE player_answer CASCADE`);
    // await this.dataSource.query(`TRUNCATE TABLE question CASCADE`);
    return;
  }
}
