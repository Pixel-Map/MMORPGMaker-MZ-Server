import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity()
export class MapAudio {
  public constructor(init?: Partial<MapAudio>) {
    Object.assign(this, init);
  }

  @PrimaryKey()
  id: string = v4();

  @Property({ default: '' })
  name: string;

  @Property({ default: 0 })
  pan: number;

  @Property({ default: 100 })
  pitch: number;

  @Property({ default: 90 })
  volume: number;
}
