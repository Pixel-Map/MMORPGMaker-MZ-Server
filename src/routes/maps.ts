import { Router } from 'express';
import MMO_Core from '../core/mmo_core';

const MapsRouter = Router();
const mmoCore = MMO_Core.getInstance();

MapsRouter.get('/:name', async (req, res) => {
    let mapName = req.params.name;

    // Dynamic Maps are above ID 1000
    let mapId = mapName.slice(3, mapName.length); // Chop off Map
    mapId = parseInt(mapId.slice(0, mapId.length - 5)); // Chop of .JSON
    if (mapId >= 1000) {
        const zeroPad = (num, places) => String(num).padStart(places, '0');
        mapName = `Map${zeroPad(mapId - 1000, 3)}.json`;
    }

    if (!/^Map[0-9a-zA-Z]+\.json$/.test(mapName)) {
        return res.status(400).json({ error: 'Bad Request' });
    }
    try {
        if (!mapId) {
            mapId = 7;
        }
        // Load dynamically from the game world!
        const map = mmoCore.gameworld.getMapById(mapId);
        // $dataMap
        if (mapId >= 1000) {
            const house = await mmoCore.database.getHouse(mapId);
            map.house = house;
        }
        res.send(map);
    } catch (e) {
        res.status(404).json({ error: 'Not found' });
    }
});

export default MapsRouter;
