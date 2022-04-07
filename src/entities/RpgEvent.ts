import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Map } from './Map';

interface EventPageConditionInterface {
    actorId: number;
    actorValid: boolean;
    itemId: number;
    itemValid: boolean;
    selfSwitch: string;
    selfSwitchValid: boolean;
    switch1Id: number;
    switch1Valid: boolean;
    switch2Id: number;
    switch2Valid: boolean;
    variableId: number;
    variableValid: boolean;
    variableValue: number;
}

interface EventPageImageInterface {
    tileId: number;
    characterName: string;
    characterIndex: number;
    direction: 2; // TOOD: switch to enum
    pattern: 0; // TODO: switch to enum
}

interface EventMoveRouteInterface {
    list: Array<EventInstructionInterface>;
    repeast: boolean;
    skippable: boolean;
    wait: boolean;
}

interface EventInstructionInterface {
    code: number; // TODO: switch to enum
    indent?: number;
    parameters: Array<string | number>;
}

interface EventPageInterface {
    conditions: EventPageConditionInterface;
    directionFix: boolean;
    image: EventPageImageInterface;
    list: Array<EventInstructionInterface>;
    moveFrequency: number;
    moveRoute: EventMoveRouteInterface;
    moveSpeed: number;
    moveType: number; // TODO: switch to enum
    priotityType: number; // TODO: switch to enum
    stepAnime: boolean;
    through: boolean;
    trigger: number; // TODO: switch to enum
    walkAnime: boolean;
}

interface EventInterface {
    id: number;
    note: string;
    pages: Array<EventPageInterface>;
    x: number;
    y: number;
}

@Entity()
export class RpgEvent {
    public constructor(init?: Partial<RpgEvent>) {
        Object.assign(this, init);
    }

    @PrimaryKey()
    id: string = v4();

    @Property({ type: 'json' })
    data: EventInterface;

    @ManyToOne()
    map: Map;
}
