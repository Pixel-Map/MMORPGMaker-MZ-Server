import { Entity, ManyToOne, PrimaryKey } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Player } from './player.entity';

@Entity()
export class HouseEntity {
  public constructor(init?: Partial<HouseEntity>) {
    Object.assign(this, init);
  }

  @PrimaryKey()
  id: number = v4();

  @ManyToOne(() => Player, { nullable: true })
  owner: Player | null;
}
