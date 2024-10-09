import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PostPg } from '../../posts/domain/post.entity';
import { CommentLikePg } from 'src/features/likes/domain/comment-like-info.entity';

@Entity()
export class CommentPg {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ collation: 'C' })
  content: string;

  @Column()
  postId: string;

  @Column()
  createdAt: Date;

  @Column()
  userId: string;

  @Column()
  userLogin: string;

  @ManyToOne(() => PostPg, (post) => post.comments)
  post: PostPg;

  @OneToMany(() => CommentLikePg, (like) => like.comment)
  extendedLikesInfo: CommentLikePg[];
}