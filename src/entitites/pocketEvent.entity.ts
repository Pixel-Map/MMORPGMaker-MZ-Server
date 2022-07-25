import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class PocketEvent {
  public constructor(init?: Partial<PocketEvent>) {
    Object.assign(this, init);
  }

  @PrimaryColumn()
  uniqueId: string;

  // ActorId -- The player who placed the item
  @Column()
  playerId: string;

  @Column()
  pItemIndex: number; // PocketEvent Item Index

  @Column()
  x: number; // X location on map

  @Column()
  y: number; // Y location on map

  @Column()
  mapId: number; // ID of the map

  @Column()
  id: number; // Event ID of the spawned event

  @Column({
    type: 'json',
    default: '{}',
  })
  variables: JSON; // Variables on events are unique to us, they aren't normally in RPGMaker!
}
