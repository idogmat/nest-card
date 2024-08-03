import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from 'src/features/users/domain/user.entity';
import { Blog } from 'src/features/blogs/domain/blog.entity';

// Tag для swagger
@ApiTags('Testing')
@Controller('testing/all-data')
export class TestingController {
  constructor(@InjectModel(User.name) private UserModel: UserModelType,
  @InjectModel(Blog.name) private BlogModel: UserModelType
) {}


  // :id в декораторе говорит nest о том что это параметр
  // Можно прочитать с помощью @Param("id") и передать в property такое же название параметра
  // Если property не указать, то вернется объект @Param()
  @Delete()
  // Для переопределения default статус кода https://docs.nestjs.com/controllers#status-code
  @HttpCode(204)
  async delete() {
    await this.UserModel.deleteMany({});
    await this.BlogModel.deleteMany({});
    return;
  }
}
