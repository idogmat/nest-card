import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/features/users/domain/user.entity';
import { Blog } from './blog.entity';

@Entity()
export class BlogBlock {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: 'uuid' })
  blogId: string;

  @Column({ type: 'uuid' })
  blockedByUserId: string;

  @Column({ type: 'text' })
  banReason: string;

  @ManyToOne(() => Blog, (blog) => blog.blogBlocks)
  blog: Blog;

  @ManyToOne(() => User, (user) => user)
  blockedByUser: User;

  @Column()
  createdAt: Date;
}

