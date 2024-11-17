import { PostLikePg } from './../../../../features/likes/domain/post-like-info.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BlogPg } from '../../blogs/domain/blog.entity';
import { CommentPg } from '../../comments/domain/comment.entity';

@Entity()
export class PostPg {
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

  @OneToMany(() => PostLikePg, (like) => like.post)
  extendedLikesInfo: PostLikePg[];

  @ManyToOne(() => BlogPg, (blog) => blog.posts)
  blog: BlogPg;

  @OneToMany(() => CommentPg, (comment) => comment.post)
  comments: CommentPg[];
}

