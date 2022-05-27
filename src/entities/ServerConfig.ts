import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class ServerConfig {
    public constructor(init?: Partial<ServerConfig>) {
        Object.assign(this, init);
    }

    @PrimaryKey()
    id!: number;

    @Property({})
    newPlayerDetails: NewPlayerDetailsInterface;

    @Property({ type: 'json', default: '{}' })
    globalSwitches: Map<string, boolean>;

    @Property({ type: 'json', default: '{}' })
    partySwitches: Map<string, boolean>;

    @Property({ type: 'json', default: '{}' })
    globalVariables: Map<string, any>;

    @Property({ type: 'json', default: '{}' })
    offlineMaps: Map<string, boolean>;
}

interface NewPlayerDetailsInterface {
    permission: number;
    mapId: number;
    x: number;
    y: number;
}
