import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Player } from './Player';

@Entity()
export class YarnSpinnerStorage {
    public constructor(init?: Partial<YarnSpinnerStorage>) {
        Object.assign(this, init);
    }

    @PrimaryKey()
    key: number = v4();

    @Property({
        type: 'json',
        default: '{}',
    })
    value: JSON;

    @ManyToOne(() => Player)
    player: Player;
}
