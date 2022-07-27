import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class MapService {
  private readonly logger = new Logger(MapService.name);
  private path = '../../' + process.env.GAME_PATH;
  private data: [];
  private gameMaps: Map<number, Game_Map>;
  private instancedMaps: any;

  constructor() {
    this.data = [];

    this.instancedMaps = [];
    this.initializeData().then((r) =>
      this.logger.log('Maps fully initialized'),
    );
  }

  // Main Loop to load data
  async initializeData() {
    await this.reloadData();
    await this.fetchMaps();
  }

  async reloadData() {
    const correctedPath = `${__dirname}/${this.path}data`;
    try {
      const stats = fs.statSync(`${correctedPath}`);

      if (!stats.isDirectory()) {
        return this.logger.log("[O] Data folder doesn't seems to exist.");
      }

      const files = fs.readdirSync(correctedPath, { withFileTypes: true });
      {
        for (const file of files) {
          const fileName = file.name.split('.json')[0];

          if (file.name.includes('.json')) {
            const fileData = fs.readFileSync(`${correctedPath}/${file.name}`, {
              encoding: 'utf-8',
            });
            this.data[fileName] = JSON.parse(fileData);
          }
        }
      }
      this.logger.log('Successfully loaded game data');
    } catch (e) {
      this.logger.error(e);
      return this.logger.error('[O] Could not find game data directory.');
    }
  }

  fetchMaps() {
    this.logger.log('[WORLD] Loading world maps');
    this.gameMaps = new Map();

    // use the file name as key in the loop, keeping only filename starting with "Map" :
    for (const fileName of Object.keys(this.data).filter(
      (name) => name.startsWith('Map') && name !== 'MapInfos',
    )) {
      // Format map from game file and and to world
      const mapId = this.getMapIdByFileName(fileName);
      const gameMap = this.getMapFromGameData(
        mapId,
        this.data[fileName],
        fileName,
      );

      this.logger.log(`[WORLD] ... ${fileName}`);
      this.gameMaps.set(mapId, gameMap);
    }

    // For dynamic loading houses

    for (let i = 0; i <= 3970; i++) {
      const mapId = i + 1000;
      const gameMap = this.getMapFromGameData(
        mapId,
        this.data['Map002'],
        'Map002',
      );
      // const exitEvent = dynamicMap.events.find((event) => event != null && event.name === 'Exit');
      // // exitEvent.x = 33;
      // exitEvent.pages[0].list[0].parameters = [0, 6, 11, 14, 0];
      // console.log(dynamicMap.events);
      this.gameMaps.set(mapId, gameMap);
    }
    this.logger.log(`[WORLD] ... Map1000-4970`);
  }

  getMapFromGameData(mapId, gameMap, fileName) {
    // a GameMap is a raw map file + some additional useful datas
    return Object.assign(gameMap, {
      mapId: this.getMapIdByFileName(fileName),
      fileName: fileName,
      lastPlayerLeftAt: null, // Date
      connectedNpcs: [], // Array of Objects
      actionsOnMap: [], // Array of Objects -> Actions currently running in instance
    });
  }

  getMapIdByFileName(fileName) {
    return Number(fileName.slice(3));
  }

  getMapById(mapId) {
    return this.gameMaps.get(mapId);
  }
}
