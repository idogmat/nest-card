import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Game } from "./game.entity";
import { Question } from "./question.entity";

@Entity()
export class QuestionOfTheGame {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne(() => Question, (q) => q.questions)
  questions: Question; // сам вопрос

  @ManyToOne(() => Game, (q) => q.questions)
  game: Game; // игра, которой принадлежит этот вопрос

  @Column()
  order: number;
}