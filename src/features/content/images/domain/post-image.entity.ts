import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from '../../posts/domain/post.entity';


@Entity()
export class PostImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column()
  width: number;

  @Column()
  height: number;

  @Column()
  fileSize: number;

  @Column({ type: 'uuid' })
  postId: string;

  @ManyToOne(() => Post, (post) => post.images)
  post: Post;
}

