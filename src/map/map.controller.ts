import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { CoreService } from '../core/core.service';

@Controller('map')
export class MapController {
  constructor(private coreService: CoreService) {}

  @Get(':name')
  getMap(@Param() params): string {
    // import MMO_Core from '../core/mmo_core';
    //
    // const MapsRouter = Router();
    // const mmoCore = MMO_Core.getInstance();
    //

    let mapName = params.name;

    // Dynamic Maps are above ID 1000
    let mapId = mapName.slice(3, mapName.length); // Chop off Map
    mapId = parseInt(mapId.slice(0, mapId.length - 5)); // Chop of .JSON
    if (mapId >= 1000) {
      const zeroPad = (num, places) => String(num).padStart(places, '0');
      mapName = `Map${zeroPad(mapId - 1000, 3)}.json`;
    }

    if (!/^Map[0-9a-zA-Z]+\.json$/.test(mapName)) {
      throw new BadRequestException('Invalid mapName!');
    }
    try {
      if (!mapId) {
        mapId = 7;
      }
      // Load dynamically from the game world!

      const map = this.coreService.getMapById(mapId);
      // $dataMap
      // if (mapId >= 1000) {
      //   const house = await mmoCore.database.getHouse(mapId);
      //   map.house = house;
      // }

      return map;
    } catch {}
  }
}
