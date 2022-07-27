export class UpdateStatsDTO {
  hp: number;
  mp: number;
  equips: number[];
  skills: number[];
  level: number;
  exp: number;
  classId: number;
  gold: number;
  items: Map<string, number>;
  armors: Map<string, number>;
  weapons: Map<string, number>;
}
