import { PostLike } from './../../../../features/likes/domain/post-like-info.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Blog } from '../../blogs/domain/blog.entity';
import { Comment } from '../../comments/domain/comment.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ collation: 'C' })
  title: string;

  @Column({ collation: 'C' })
  shortDescription: string;

  @Column({ collation: 'C' })
  content: string;

  @Column({ type: 'uuid' })
  blogId: string;

  @Column()
  createdAt: Date;

  @OneToMany(() => PostLike, (like) => like.post)
  extendedLikesInfo: PostLike[];

  @ManyToOne(() => Blog, (blog) => blog.posts)
  blog: Blog;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
}

