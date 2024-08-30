import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from 'src/features/users/domain/user.entity';
import { Blog, BlogModelType } from 'src/features/blogs/domain/blog.entity';
import { Post, PostModelType } from 'src/features/posts/domain/post.entity';
import { Comment, CommentModelType } from 'src/features/comments/domain/comment.entity';
import { DeviceModelType } from 'src/features/devices/domain/device.entity';

// Tag для swagger
@ApiTags('Testing')
@Controller('testing/all-data')
export class TestingController {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(Comment.name) private DeviceModel: DeviceModelType,
  ) { }


  // :id в декораторе говорит nest о том что это параметр
  // Можно прочитать с помощью @Param("id") и передать в property такое же название параметра
  // Если property не указать, то вернется объект @Param()
  @Delete()
  // Для переопределения default статус кода https://docs.nestjs.com/controllers#status-code
  @HttpCode(204)
  async delete() {
    await this.UserModel.deleteMany({});
    await this.BlogModel.deleteMany({});
    await this.PostModel.deleteMany({});
    await this.CommentModel.deleteMany({});
    await this.DeviceModel.deleteMany({});
    return;
  }
}
