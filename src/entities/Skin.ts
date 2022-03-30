import { Entity, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from './User';

@Entity()
export class Skin {
    public constructor(init?: Partial<Skin>) {
        Object.assign(this, init);
    }

    @PrimaryKey()
    id!: number;

    @OneToOne(() => User)
    user: User;

    @Property({ default: 'NPCizzleTest' })
    battlerName: string;

    @Property({ default: 0 })
    characterIndex: number;

    @Property({ default: 'NPCizzleTest' })
    characterName: string;

    @Property({ default: 0 })
    faceIndex: number;

    @Property({ default: 'NPCizzleTest' })
    faceName: string;
}
