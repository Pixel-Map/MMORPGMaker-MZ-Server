import {
  Entity,
  EntityRepository,
  EntityRepositoryType,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

@Entity({ customRepository: () => GlobalSwitchRepository })
export class GlobalSwitch {
  [EntityRepositoryType]?: GlobalSwitchRepository;

  public constructor(init?: Partial<GlobalSwitch>) {
    Object.assign(this, init);
  }

  @PrimaryKey()
  id!: number;

  @Property()
  value!: boolean;
}

export class GlobalSwitchRepository extends EntityRepository<GlobalSwitch> {}
