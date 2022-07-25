import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class CoreService {
  private readonly logger = new Logger(CoreService.name);
  private path = '../../' + process.env.GAME_PATH;
  private data;
  private gameData: any;
  private gameMaps: any;
  private instanceableMaps: any;

  constructor() {
    this.data = [];
    this.gameData = [];
    this.instanceableMaps = [];
    this.reloadData().then(() => {
      this.fetchMaps();
    });
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
    this.gameMaps = [];
    this.gameData = [];
    // use the file name as key in the loop, keeping only filename starting with "Map" :
    for (const fileName of Object.keys(this.data).filter(
      (name) => name.startsWith('Map') && name !== 'MapInfos',
    )) {
      // Format map from game file and and to world

      const _gameMap = this.getMapFromGameData(this.data[fileName], fileName);

      this.logger.log(`[WORLD] ... ${fileName}`);
      this.gameMaps.push(_gameMap);

      this.instanceableMaps.push(_gameMap);
    }

    // For dynamic loading houses
    const _gameMap = this.getMapFromGameData(this.data['Map002'], 'Map002');
    for (let i = 0; i <= 3970; i++) {
      const dynamicMap = { ..._gameMap };
      dynamicMap.id = i + 1000;
      dynamicMap.mapId = i + 1000;
      // const exitEvent = dynamicMap.events.find((event) => event != null && event.name === 'Exit');
      // // exitEvent.x = 33;
      // exitEvent.pages[0].list[0].parameters = [0, 6, 11, 14, 0];
      // console.log(dynamicMap.events);
      this.gameMaps.push(dynamicMap);
    }
  }
  getMapFromGameData(gameMap, fileName) {
    // a GameMap is a raw map file + some additional useful datas
    return Object.assign(gameMap, {
      mapId: this.getMapIdByFileName(fileName),
      fileName,
      isSummonMap: this.isSummonMap(gameMap),
      nodeType: 'map',
    });
  }
  isSummonMap(map) {
    return map.note && map.note.toUpperCase().includes('<SUMMON>');
  }
  getSummonMap() {
    return this.gameMaps.find((map) => map.isSummonMap);
  }
  getMapIdByFileName(fileName) {
    return Number(fileName.slice(3));
  }
  getMapById(mapId) {
    return this.gameMaps.find((map) => map.mapId === mapId);
  }
}
