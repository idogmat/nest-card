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
    await this.dataSource.query(`TRUNCATE TABLE device_pg CASCADE`);
    await this.dataSource.query(`TRUNCATE TABLE user_pg CASCADE`);
    await this.dataSource.query(`TRUNCATE TABLE blog_pg CASCADE`);
    await this.dataSource.query(`TRUNCATE TABLE post_pg CASCADE`);
    await this.dataSource.query(`TRUNCATE TABLE post_like_pg CASCADE`);
    await this.dataSource.query(`TRUNCATE TABLE comment_pg CASCADE`);
    await this.dataSource.query(`TRUNCATE TABLE comment_like_pg CASCADE`);
    return;
  }

  @Delete('/game')
  @HttpCode(204)
  async deleteGame() {
    await this.dataSource.query(`TRUNCATE TABLE game CASCADE`);
    await this.dataSource.query(`TRUNCATE TABLE player_progress CASCADE`);
    await this.dataSource.query(`TRUNCATE TABLE question_of_the_game CASCADE`);
    return;
  }
}
