import { v4 } from 'uuid';
import { MapAudio } from './MapAudio.entity';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Map {
  public constructor(init?: Partial<Map>) {
    Object.assign(this, init);
  }

  @PrimaryColumn()
  id: string = v4();

  @Column()
  rpgmakerId: number;

  @Column({ default: 0 })
  width: number;

  @Column({ default: 0 })
  height: number;

  @Column({ default: false })
  autoplayBgm: boolean;

  @Column({ default: false })
  autoplayBgs: boolean;

  @Column({ default: '' })
  battleback1Name: string;

  @Column({ default: '' })
  battleback2Name: string;

  @Column({ default: false })
  disableDashing: boolean;

  @Column({ default: '' })
  displayName: string;

  @Column({ default: 30 })
  encounterStep: number;

  @Column({ default: '' })
  note: string;

  @Column({ default: false })
  parallaxLoopX: false;

  @Column({ default: false })
  parallaxLoopY: false;

  @Column({ default: '' })
  parallaxName: string;

  @Column({ default: true })
  parallaxShow: boolean;

  @Column({ default: 0 })
  parallaxSx: number;

  @Column({ default: 0 })
  parallaxSy: number;

  @Column({ default: 0 })
  scrollType: number;

  @Column({ default: false })
  specifyBattleback: false;

  @Column({ default: 1 })
  tilesetId: number;

  @ManyToOne(() => MapAudio)
  bgm: MapAudio;

  @ManyToOne(() => MapAudio)
  bgs: MapAudio;
}
