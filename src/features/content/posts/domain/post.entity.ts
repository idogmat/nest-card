import { PostLikePg } from 'src/features/likes/domain/post-like-info.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BlogPg } from '../../blogs/domain/blog.entity';

@Entity()
export class PostPg {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column()
  shortDescription: string;

  @Column()
  content: string;

  @Column({ type: 'uuid' })
  blogId: string;

  @Column()
  createdAt: Date;

  @OneToMany(() => PostLikePg, (like) => like.post)
  extendedLikesInfo: PostLikePg[];

  @ManyToOne(() => BlogPg, (blog) => blog.posts)
  blog: BlogPg;
}

