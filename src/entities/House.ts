import { Entity, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Skin } from './Skin';
import { Stats } from './Stats';
import { Player } from './Player';

@Entity()
export class House {
    public constructor(init?: Partial<House>) {
        Object.assign(this, init);
    }

    @PrimaryKey()
    id: string = v4();

    @OneToOne(() => Player)
    owner: Player | null;
}
