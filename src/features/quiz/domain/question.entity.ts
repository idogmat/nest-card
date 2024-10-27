import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { QuestionOfTheGame } from "./questionsForGame.entity";

// Учебная таблица, в которой пока нет всех нужных полей
@Entity()
export class Question {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public body: string;

  @Column()
  public createdAt: Date;

  @Column()
  public updatedAt: Date;

  @Column("text", { array: true })
  public correctAnswers: string[];

  @Column({ type: 'boolean', default: false })
  published: boolean;

  @OneToMany(() => QuestionOfTheGame, (q) => q.questions)
  questions: QuestionOfTheGame;
}