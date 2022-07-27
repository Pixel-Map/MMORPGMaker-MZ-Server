export class GameMap {
  mapId: number;
  fileName: string;
  lastPlayerLeftAt: Date;
  connectedNpcs: []; // Array of Objects
  actionsOnMap: []; // Array of Objects -> Actions currently running in instance
}
