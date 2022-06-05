import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class PocketEvent {
    public constructor(init?: Partial<PocketEvent>) {
        Object.assign(this, init);
    }

    @PrimaryKey()
    uniqueId: string;

    // ActorId -- The player who placed the item
    @Property()
    playerId: string;

    @Property()
    pItemIndex: number; // PocketEvent Item Index

    @Property()
    x: number; // X location on map

    @Property()
    y: number; // Y location on map

    @Property()
    mapId: number; // ID of the map

    @Property()
    id: number; // Event ID of the spawned event
}
