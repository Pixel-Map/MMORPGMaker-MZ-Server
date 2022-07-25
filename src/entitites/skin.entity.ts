import { Player } from './Player.entity';
import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Skin {
  public constructor(init?: Partial<Skin>) {
    Object.assign(this, init);
  }

  @PrimaryColumn()
  id!: number;

  @OneToOne(() => Player)
  user: Player;

  @Column({ default: 'Actor1' })
  battlerName: string;

  @Column({ default: 0 })
  characterIndex: number;

  @Column({ default: 'Actor1' })
  characterName: string;

  @Column({ default: 0 })
  faceIndex: number;

  @Column({ default: 'Actor1' })
  faceName: string;
}
