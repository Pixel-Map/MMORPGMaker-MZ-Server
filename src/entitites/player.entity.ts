import { v4 } from 'uuid';
import { Skin } from './Skin.entity';
import { Stats } from './Stats.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Player {
  public constructor(init?: Partial<Player>) {
    Object.assign(this, init);
  }

  @PrimaryGeneratedColumn()
  id: string = v4();

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ default: 0 })
  x: number;

  @Column({ default: 0 })
  y: number;

  @Column({ nullable: true })
  status: string;

  @Column({ default: 1 })
  mapId: number;

  @Column({ default: 0 })
  permission: number;

  token: string; // JWT Token for Web auth

  @OneToOne(() => Skin, (skin) => skin.user)
  skin: Skin;

  @OneToOne(() => Stats, (stats) => stats.user)
  stats?: Stats;

  @Column({ type: 'json', default: '{}' })
  variables: JSON;

  @Column({ type: 'json', default: '{}' })
  switches: JSON; // Yes it's actually armors.

  @Column({ default: '' })
  ens: string; // ENS nickname, only relevant for Web3 games
}
