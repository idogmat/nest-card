import { CommentPg } from 'src/features/content/comments/domain/comment.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export type LikeType = 'None' | 'Like' | 'Dislike';

export interface LikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeType;
  newestLikes?: NewestLikes[];
}

export class NewestLikes {
  addedAt: string;

  userId: string;

  login: string;
}

@Entity()
export class CommentLikePg {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column()
  commentId: string;

  @Column()
  userId: string;

  @Column()
  addedAt: Date;

  @Column()
  login: string;

  @ManyToOne(() => CommentPg, (comment) => comment.extendedLikesInfo)
  comment: CommentPg;
}
