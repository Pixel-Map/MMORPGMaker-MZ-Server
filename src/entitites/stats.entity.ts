import { Player } from './Player.entity';
import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Stats {
  public constructor(init?: Partial<Stats>) {
    Object.assign(this, init);
  }

  @PrimaryColumn()
  id!: number;

  @OneToOne(() => Player)
  user: Player;

  @Column({ default: 1 })
  classId: number;

  @Column({ default: 0 })
  exp: number;

  @Column({ default: 544 })
  hp: number;

  @Column({ default: 41 })
  mp: number;

  @Column({ default: 1 })
  level: number;

  @Column({ type: 'json', default: '{}' })
  items: JSON;

  @Column({ type: 'json', default: '{}' })
  weapons: JSON;

  @Column({ type: 'json', default: '{}' })
  armors: JSON; // Yes it's actually armors.

  @Column({ default: 0 })
  gold: number;

  @Column({ default: [], nullable: false })
  equips: number[];

  @Column({ default: [], nullable: false })
  skills: number[];
}
