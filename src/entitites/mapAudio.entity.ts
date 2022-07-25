import { v4 } from 'uuid';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class MapAudio {
  public constructor(init?: Partial<MapAudio>) {
    Object.assign(this, init);
  }

  @PrimaryColumn()
  id: string = v4();

  @Column({ default: '' })
  name: string;

  @Column({ default: 0 })
  pan: number;

  @Column({ default: 100 })
  pitch: number;

  @Column({ default: 90 })
  volume: number;
}
