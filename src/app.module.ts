import { Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppSettings, appSettings } from './settings/app-settings';
import { UsersRepository } from './features/users/infrastructure/users.repository';
import { UsersService } from './features/users/application/users.service';
import { UsersQueryRepository } from './features/users/infrastructure/users.query-repository';
import { User, UserSchema } from './features/users/domain/user.entity';
import { UsersController } from './features/users/api/users.controller';
import { AuthService } from './features/auth/application/auth.service';
import { BlogsRepository } from './features/blogs/infrastructure/blogs.repository';
import { BlogsService } from './features/blogs/application/blogs.service';
import { Blog, BlogSchema } from './features/blogs/domain/blog.entity';
import { BlogsController } from './features/blogs/api/blogs.controller';
import { TestingController } from './features/testing/api/testing.controller';
import { BlogsQueryRepository } from './features/blogs/infrastructure/blogs.query-repository';
import { Post, PostSchema } from './features/posts/domain/post.entity';
import { PostsRepository } from './features/posts/infrastructure/posts.repository';
import { PostsQueryRepository } from './features/posts/infrastructure/posts.query-repository';
import { PostsService } from './features/posts/application/posts.service';
import { PostsController } from './features/posts/api/posts.controlle';
import { CommentsController } from './features/comments/api/comments.controller';
import { Comment, CommentSchema } from './features/comments/domain/comment.entity';
import { CommentsQueryRepository } from './features/comments/infrastructure/comments.query-repository';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthController } from './features/auth/api/auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './features/auth/strategies/jwt.strategy';
import { LocalStrategy } from './features/auth/strategies/local.strategy';
import { EmailService } from './features/auth/application/email.service';
import { CustomCodeValidation, CustomEmailExistValidation, CustomEmailValidation, CustomLoginValidation } from './common/decorators/validate/is-email-or-login-exist';

const usersProviders: Provider[] = [
  UsersRepository,
  UsersService,
  UsersQueryRepository,
];
const blogsProviders: Provider[] = [
  BlogsRepository,
  BlogsService,
  BlogsQueryRepository,
];
const postsProviders: Provider[] = [
  PostsRepository,
  PostsService,
  PostsQueryRepository,
];
const validators: Provider[] = [
  CustomEmailValidation,
  CustomLoginValidation,
  CustomCodeValidation,
  CustomEmailExistValidation,
];
const authProviders: Provider[] = [
  AuthService,
  JwtService,
  JwtStrategy,
  LocalStrategy,
  EmailService,
];
const commentsProviders: Provider[] = [
  // CommentsRepository,
  // CommentsService,
  CommentsQueryRepository,
];
@Module({
  // Регистрация модулей
  imports: [
    MongooseModule.forRoot(appSettings.env.isTesting()
      ? appSettings.api.MONGO_CONNECTION_URI_FOR_TESTS
      : appSettings.api.MONGO_CONNECTION_URI),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      // { name: Like.name, schema: LikeSchema },
    ]),
    JwtModule.register({
      secret: appSettings.api.ACCESS_SECRET_TOKEN,
      signOptions: { expiresIn: appSettings.api.ACCESS_SECRET_TOKEN_EXPIRATION }
    }),
    PassportModule
  ],
  // Регистрация провайдеров
  providers: [
    ...validators,
    ...usersProviders,
    ...blogsProviders,
    ...postsProviders,
    ...commentsProviders,
    ...authProviders,
    {
      provide: AppSettings,
      useValue: appSettings,
    },
  ],
  // Регистрация контроллеров
  controllers: [
    AuthController,
    UsersController,
    BlogsController,
    PostsController,
    CommentsController,
    TestingController,
  ],
})
export class AppModule { }
