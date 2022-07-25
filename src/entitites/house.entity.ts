import { v4 } from 'uuid';
import { Player } from './Player.entity';
import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class House {
  public constructor(init?: Partial<House>) {
    Object.assign(this, init);
  }

  @PrimaryColumn()
  id: number = v4();

  @ManyToOne(() => Player, { nullable: true })
  owner: Player | null;
}
