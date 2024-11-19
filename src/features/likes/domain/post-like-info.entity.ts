import { Post } from './../../../features/content/posts/domain/post.entity';
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
export class PostLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: LikeType;

  @Column({ type: 'uuid' })
  postId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column()
  addedAt: Date;

  @Column()
  login: string;

  @ManyToOne(() => Post, (post) => post.extendedLikesInfo)
  post: Post;
}
