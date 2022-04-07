import { ArrayType, Collection, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity()
export class Encounter {
    public constructor(init?: Partial<Encounter>) {
        Object.assign(this, init);
    }

    @PrimaryKey()
    id: string = v4();

    @Property()
    troopId: number;

    @Property({ default: 0 })
    weight: number;

    @Property({ type: new ArrayType((i) => parseInt(i)) })
    regionSet: Array<number>;
}
