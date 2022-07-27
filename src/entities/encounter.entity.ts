import { ArrayType, Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity()
export class EncounterEntity {
  public constructor(init?: Partial<EncounterEntity>) {
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
