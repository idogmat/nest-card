import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Blog } from '../../blogs/domain/blog.entity';

export enum ImageType {
  Wallpaper,
  Main,
}

@Entity()
export class BlogImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ImageType })
  type: ImageType;

  @Column()
  url: string;

  @Column()
  fileSize: number;

  @Column({ type: 'uuid' })
  blogId: string;

  @ManyToOne(() => Blog, (blog) => blog.images)
  blog: Blog;
}

