import { Injectable } from '@nestjs/common';
import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';
import { PostsRepository } from 'src/features/posts/infrastructure/posts.repository';

@Injectable()
export class CommentsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: BlogsRepository,
  ) { }

}
