export class NewPlayerDefaults {
  static readonly MAPID = 1;
  static readonly X = 5;
  static readonly Y = 5;
  static readonly PERMISSION = 0;
  static readonly BATTLER_NAME = '';
  static readonly FACE_NAME = '';

  static readonly CHARACTER_INDEX = 0;
  static readonly CHARACTER_NAME = 'charsheet_hero%(6)';
  static readonly FACE_INDEX = 0;
}

export class SmashHouseDefaults {
  // The RPGMaker IDs for storing the winning player names
  static readonly FIRST_PLACE_NAME_ID = 27;
  static readonly SECOND_PLACE_NAME_ID = 28;
  static readonly THIRD_PLACE_NAME_ID = 29;

  // The default winner names (reset daily)
  static readonly FIRST_PLACE_NAME = 'Mr. Bocks';
  static readonly SECOND_PLACE_NAME = 'MC_Waifu';
  static readonly THIRD_PLACE_NAME = 'CATNIPLOVER29';

  // The RPGMaker IDs for storign the winning player scores
  static readonly FIRST_PLACE_SCORE_ID = 30;
  static readonly SECOND_PLACE_SCORE_ID = 31;
  static readonly THIRD_PLACE_SCORE_ID = 32;

  // The default winner scores (reset daily)
  static readonly FIRST_PLACE_SCORE = 29;
  static readonly SECOND_PLACE_SCORE = 19;
  static readonly THIRD_PLACE_SCORE = 17;

  // The current date for SmashHouse
  static readonly DATE = 33;
}
