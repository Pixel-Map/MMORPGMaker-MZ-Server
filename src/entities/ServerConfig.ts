import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class ServerConfig {
    public constructor(init?: Partial<ServerConfig>) {
        Object.assign(this, init);
    }

    @PrimaryKey()
    id!: number;

    @Property({ default: 0 })
    permission: number;

    @Property({ default: 0 })
    mapId: number;

    @Property({ default: 0 })
    x: number;

    @Property({ default: 0 })
    y: number;
}
//
//
// passwordRequired: true,
//     globalSwitches: {},
// partySwitches: {},
// globalVariables: {},
// offlineMaps: {},
