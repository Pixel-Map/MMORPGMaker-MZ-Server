import { Entity, ManyToOne, PrimaryKey } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Player } from './Player';

@Entity()
export class House {
    public constructor(init?: Partial<House>) {
        Object.assign(this, init);
    }

    @PrimaryKey()
    id: number = v4();

    @ManyToOne(() => Player, { nullable: true })
    owner: Player | null;
}
