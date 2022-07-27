import {
  Entity,
  EntityRepository,
  EntityRepositoryType,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

@Entity({ customRepository: () => GlobalVariableRepository })
export class GlobalVariable {
  [EntityRepositoryType]?: GlobalVariableRepository;

  public constructor(init?: Partial<GlobalVariable>) {
    Object.assign(this, init);
  }

  @PrimaryKey()
  id!: number;

  @Property({ type: 'json', default: '{}' })
  value: JSON;
}

export class GlobalVariableRepository extends EntityRepository<GlobalVariable> {}
