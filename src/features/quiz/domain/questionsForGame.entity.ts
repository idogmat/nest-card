import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Game } from "./game.entity";
import { Question } from "./question.entity";

@Entity()
export class QuestionOfTheGame {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'uuid' })
  questionId: string;

  @ManyToOne(() => Question, (q) => q.questions)
  question: Question;

  @Column({ type: 'uuid' })
  gameId: string;

  @ManyToOne(() => Game, (q) => q)
  game: Game; // игра, которой принадлежит этот вопрос

  @Column()
  order: number;
}