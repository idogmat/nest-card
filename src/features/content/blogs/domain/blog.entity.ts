import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from '../../posts/domain/post.entity';
import { User } from 'src/features/users/domain/user.entity';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ collation: 'C' })
  name: string;

  @Column({ collation: 'C' })
  description: string;

  @Column()
  websiteUrl: string;

  @Column()
  createdAt: Date;

  @Column()
  isMembership: boolean;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => User, (user) => user.blogs)
  user: User;

  @OneToMany(() => Post, (post) => post.blog)
  posts: Post[];



  static createBlog(name: string, description: string, websiteUrl: string) {
    const blog = new this();

    blog.name = name;
    blog.description = description;
    blog.websiteUrl = websiteUrl;
    blog.createdAt = new Date();
    blog.isMembership = false;

    return blog;
  }


}

