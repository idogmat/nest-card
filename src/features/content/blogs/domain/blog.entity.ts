import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PostPg } from '../../posts/domain/post.entity';

@Entity()
export class BlogPg {
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

  @OneToMany(() => PostPg, (post) => post.blog)
  posts: PostPg[];



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

