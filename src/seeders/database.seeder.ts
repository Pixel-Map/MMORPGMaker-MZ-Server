import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { GlobalVariable } from '../common/globalVariable.entity';
import { SmashHouseDefaults } from '../common/constants';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // Default Smash House Winner Names
    em.create(GlobalVariable, {
      id: SmashHouseDefaults.FIRST_PLACE_NAME_ID,
      value: SmashHouseDefaults.FIRST_PLACE_NAME,
    });
    em.create(GlobalVariable, {
      id: SmashHouseDefaults.SECOND_PLACE_NAME_ID,
      value: SmashHouseDefaults.SECOND_PLACE_NAME,
    });
    em.create(GlobalVariable, {
      id: SmashHouseDefaults.THIRD_PLACE_NAME_ID,
      value: SmashHouseDefaults.THIRD_PLACE_NAME,
    });

    // Default Smash House Winner Values
    em.create(GlobalVariable, {
      id: SmashHouseDefaults.FIRST_PLACE_SCORE_ID,
      value: SmashHouseDefaults.FIRST_PLACE_SCORE,
    });
    em.create(GlobalVariable, {
      id: SmashHouseDefaults.SECOND_PLACE_SCORE_ID,
      value: SmashHouseDefaults.SECOND_PLACE_SCORE,
    });
    em.create(GlobalVariable, {
      id: SmashHouseDefaults.THIRD_PLACE_SCORE_ID,
      value: SmashHouseDefaults.THIRD_PLACE_SCORE,
    });

    // but if we would do `const author = new Author()` instead,
    // we would need to call `em.persist(author)` explicitly.
  }
}
