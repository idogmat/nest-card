import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PlayerProgress } from "./player.entity";

@Entity()
export class PlayerAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  answer: string;

  @Column()
  order: number;

  @Column({ type: 'uuid' })
  questionId: string;

  @Column({ type: 'uuid' })
  processId: string;

  @Column({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => PlayerProgress, (p) => p.answers)
  process: PlayerProgress;

}