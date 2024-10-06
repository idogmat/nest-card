import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CommentPg {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column()
  postId: string;

  @Column()
  createdAt: number;

  @Column()
  userId: string;

  @Column()
  userLogin: string;

}