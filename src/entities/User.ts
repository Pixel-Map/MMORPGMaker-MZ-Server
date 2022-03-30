import { Entity, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Skin } from './Skin';
import { Stats } from './Stats';

@Entity()
export class User {
    public constructor(init?: Partial<User>) {
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

    @Property({ default: false })
    isBusy: boolean;

    @Property({ default: 1 })
    mapId: number;

    @Property({ default: 0 })
    permission: number;

    @OneToOne(() => Skin, (skin) => skin.user)
    skin: Skin;

    @OneToOne(() => Stats, (stats) => stats.user)
    stats?: Stats;
}
