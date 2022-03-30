import { ArrayType, Entity, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from './User';

@Entity()
export class Stats {
    public constructor(init?: Partial<Stats>) {
        Object.assign(this, init);
    }

    @PrimaryKey()
    id!: number;

    @OneToOne(() => User)
    user: User;

    @Property({ default: 1 })
    classId: number;

    @Property({ default: 0 })
    exp: number;

    @Property({ default: 544 })
    hp: number;

    @Property({ default: 41 })
    mp: number;

    @Property({ default: 1 })
    level: number;

    @Property({ default: 3 })
    items: number;

    @Property({ default: 0 })
    gold: number;

    @Property({ type: ArrayType, default: [], nullable: false })
    equips: number[];

    @Property({ type: ArrayType, default: [], nullable: false })
    skills: number[];
}
