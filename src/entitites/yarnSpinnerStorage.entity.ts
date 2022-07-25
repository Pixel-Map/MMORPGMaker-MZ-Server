import { v4 } from 'uuid';
import { Player } from './Player.entity';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class YarnSpinnerStorage {
  public constructor(init?: Partial<YarnSpinnerStorage>) {
    Object.assign(this, init);
  }

  @PrimaryColumn()
  key: number = v4();

  @Column({
    type: 'json',
    default: '{}',
  })
  value: JSON;

  @ManyToOne(() => Player)
  player: Player;
}
