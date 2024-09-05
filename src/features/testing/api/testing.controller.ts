import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from 'src/features/auth/application/auth.service';

// Tag для swagger
@ApiTags('Testing')
@Controller('testing/all-data')
export class TestingController {
  constructor(
    private readonly authService: AuthService,
  ) { }

  @Delete()
  @HttpCode(204)
  async delete() {
    await this.authService._clearDb();
    return;
  }
}
