import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from '../../posts/domain/post.entity';
import { CommentLike } from './../../../../features/likes/domain/comment-like-info.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ collation: 'C' })
  content: string;

  @Column()
  postId: string;

  @Column()
  createdAt: Date;

  @Column({ type: 'uuid' })
  userId: string;

  @Column()
  userLogin: string;

  @ManyToOne(() => Post, (post) => post.comments)
  post: Post;

  @OneToMany(() => CommentLike, (like) => like.comment)
  extendedLikesInfo: CommentLike[];
}