import { CommentPg } from './../../../features/content/comments/domain/comment.entity';
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
  type: LikeType;

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
