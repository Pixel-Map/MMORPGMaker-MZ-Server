import {
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { MapAudio } from './mapAudio.entity';
import { EncounterEntity } from './encounter.entity';
import { RpgEvent } from './rpgEvent.entity';

@Entity()
export class Map {
  public constructor(init?: Partial<Map>) {
    Object.assign(this, init);
  }

  @PrimaryKey()
  id: string = v4();

  @Property()
  rpgmakerId: number;

  @Property({ default: 0 })
  width: number;

  @Property({ default: 0 })
  height: number;

  @Property({ default: false })
  autoplayBgm: boolean;

  @Property({ default: false })
  autoplayBgs: boolean;

  @Property({ default: '' })
  battleback1Name: string;

  @Property({ default: '' })
  battleback2Name: string;

  @Property({ default: false })
  disableDashing: boolean;

  @Property({ default: '' })
  displayName: string;

  @Property({ default: 30 })
  encounterStep: number;

  @Property({ default: '' })
  note: string;

  @Property({ default: false })
  parallaxLoopX: false;

  @Property({ default: false })
  parallaxLoopY: false;

  @Property({ default: '' })
  parallaxName: string;

  @Property({ default: true })
  parallaxShow: boolean;

  @Property({ default: 0 })
  parallaxSx: number;

  @Property({ default: 0 })
  parallaxSy: number;

  @Property({ default: 0 })
  scrollType: number;

  @Property({ default: false })
  specifyBattleback: false;

  @Property({ default: 1 })
  tilesetId: number;

  @ManyToOne()
  bgm: MapAudio;

  @ManyToOne()
  bgs: MapAudio;

  @ManyToMany(() => EncounterEntity)
  encounterList: Collection<EncounterEntity> = new Collection<EncounterEntity>(
    this,
  );

  @OneToMany(() => RpgEvent, (event) => event.map)
  events = new Collection<RpgEvent>(this);
}
