import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from 'src/features/auth/application/auth.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

// Tag для swagger
@ApiTags('Testing')
@Controller('testing/all-data')
export class TestingController {
  constructor(
    private readonly authService: AuthService,
    @InjectDataSource() protected dataSource: DataSource
  ) { }

  @Delete()
  @HttpCode(204)
  async delete() {
    await this.authService._clearDb();
    this.dataSource.query(`TRUNCATE TABLE user_pg`);
    return;
  }
}
