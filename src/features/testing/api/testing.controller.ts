import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { S3StorageAdapter } from 'src/features/s3/adapter/adapter.s3';

// Tag для swagger
@ApiTags('Testing')
@Controller('testing/all-data')
export class TestingController {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private readonly s3StorageAdapter: S3StorageAdapter
  ) { }

  @Delete()
  @HttpCode(204)
  async delete() {
    await this.dataSource.query(`TRUNCATE TABLE 
      "user",
      "device",
      "blog",
      "blog_image",
      "blog_block",
      "subscribe_blog",
      "post",
      "post_like",
      "post_image",
      "comment",
      "comment_like",
      "game",
      "player_progress",
      "question_of_the_game",
      "player_answer",
      "question"
       CASCADE`);
    // await this.s3StorageAdapter.clearBucket()
    return;
  }

  @Delete('/game')
  @HttpCode(204)
  async deleteGame() {
    await this.s3StorageAdapter.clearBucket()
    // await this.dataSource.query(`TRUNCATE TABLE game CASCADE`);
    // await this.dataSource.query(`TRUNCATE TABLE player_progress CASCADE`);
    // await this.dataSource.query(`TRUNCATE TABLE question_of_the_game CASCADE`);
    // await this.dataSource.query(`TRUNCATE TABLE player_answer CASCADE`);
    // await this.dataSource.query(`TRUNCATE TABLE question CASCADE`);
    return;
  }
}
