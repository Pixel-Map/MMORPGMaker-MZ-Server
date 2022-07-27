import { Entity, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Player } from './player.entity';

@Entity()
export class Skin {
  public constructor(init?: Partial<Skin>) {
    Object.assign(this, init);
  }

  @PrimaryKey()
  id!: number;

  @OneToOne(() => Player)
  user: Player;

  @Property({ default: 'Actor1' })
  battlerName: string;

  @Property({ default: 0 })
  characterIndex: number;

  @Property({ default: 'Actor1' })
  characterName: string;

  @Property({ default: 0 })
  faceIndex: number;

  @Property({ default: 'Actor1' })
  faceName: string;
}
