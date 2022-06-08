import { Entity, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Skin } from './Skin';
import { Stats } from './Stats';

@Entity()
export class Player {
    public constructor(init?: Partial<Player>) {
        Object.assign(this, init);
    }

    @PrimaryKey()
    id: string = v4();

    @Property()
    username: string;

    @Property()
    password: string;

    @Property({ default: 0 })
    x: number;

    @Property({ default: 0 })
    y: number;

    @Property({ nullable: true })
    status: string;

    @Property({ default: 1 })
    mapId: number;

    @Property({ default: 0 })
    permission: number;

    @Property({ persist: false })
    token: string; // JWT Token for Web auth

    @OneToOne(() => Skin, (skin) => skin.user)
    skin: Skin;

    @OneToOne(() => Stats, (stats) => stats.user)
    stats?: Stats;

    @Property({ type: 'json', default: '{}' })
    variables: JSON;

    @Property({ type: 'json', default: '{}' })
    switches: JSON; // Yes it's actually armors.

    @Property({ default: '' })
    ens: string; // ENS nickname, only relevant for Web3 games
}
