import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ServerConfig {
  public constructor(init?: Partial<ServerConfig>) {
    Object.assign(this, init);
  }

  @PrimaryColumn()
  id!: number;

  @Column({})
  newPlayerDetails: NewPlayerDetailsInterface;

  @Column({ type: 'json', default: '{}' })
  globalSwitches: Map<string, boolean>;

  @Column({ type: 'json', default: '{}' })
  partySwitches: Map<string, boolean>;

  @Column({ type: 'json', default: '{}' })
  globalVariables: Map<string, any>;

  @Column({ type: 'json', default: '{}' })
  offlineMaps: Map<string, boolean>;
}

interface NewPlayerDetailsInterface {
  permission: number;
  mapId: number;
  x: number;
  y: number;
}
