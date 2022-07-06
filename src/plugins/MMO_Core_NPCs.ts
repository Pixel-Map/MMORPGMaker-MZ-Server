//=============================================================================
// MMO_Core_Npcs.js
//=============================================================================

/*:
 * @plugindesc MMORPG Maker MV - Core Handling Sync NPCs
 * @author Axel Fiolle
 *
 * @help This plugin does not provide plugin commands.
 */

import MMO_Core from './MMO_Core';
import MMO_Core_Player from './MMO_Core_Player';

class Core_NPCs {
    npcs = {};

    findConnectedNpc(npc) {
        return npc && this.findNpcBy('uniqueId', npc.uniqueId);
    }

    findMapNpc(npc) {
        npc && this.findNpcBy('_eventId', npc.eventId);
    }

    findNpcBy(name, prop) {
        if (!$gameMap || !name || !prop) return;
        return $gameMap._events.find(
            // @ts-ignore
            (event) => event && event._eventData && event._eventData[name] && event._eventData[name] === prop,
        );
    }

    addNpc(data) {
        const spriteName = data._image.characterName;
        const spriteDir = data._image.characterIndex;
        // @ts-ignore
        this.npcs[data.id] = $gameMap.createNormalEventAt(
            spriteName,
            spriteDir,
            data.x,
            data.y,
            2,
            0,
            true,
            data.pages,
            data.uniqueId,
        );
        this.npcs[data.id].setPosition(data.x, data.y);
        // console.log('MMO_Core_Npcs.Npcs[data.id]', MMO_Core_Npcs.Npcs[data.id])
    }
}

// Initialize
const MMO_Core_Npcs = new Core_NPCs();

MMO_Core.socket.on('npcsFetched', async (data) => {
    if (data.playerId !== MMO_Core_Player.Player['id']) return;
    else
        data.npcs.map((npc) => {
            if ($gameMap._events[npc.eventId]) $gameMap.eraseEvent(npc.eventId);
            if (MMO_Core_Npcs.findConnectedNpc(npc)) {
                // @ts-ignore
                $gameMap.eraseConnectedEvent(npc.uniqueId);
            }
            MMO_Core_Npcs.addNpc(npc);
        });
});

MMO_Core.socket.on('npcSpawn', async (data) => {
    console.log(data);
    if (!$gameMap || $gameMap._mapId !== data.mapId) return;
    if (data.summonable) MMO_Core_Npcs.addNpc(data);
});

MMO_Core.socket.on('npcRespawn', (data) => {
    if (!$gameMap || $gameMap._mapId !== data.mapId) return;
    MMO_Core_Npcs.addNpc(data);
    // TODO : play animation
});

MMO_Core.socket.on('npcLooted', function (data) {
    if (!$gameMap || $gameMap._mapId !== data.mapId) return;
    if (!MMO_Core_Npcs.npcs[data.uniqueId]) return;
    // @ts-ignore
    $gameMap.eraseConnectedEvent(npc.uniqueId);
});

MMO_Core.socket.on('npcRemove', function (data) {
    if (!MMO_Core_Npcs.findConnectedNpc(data.uniqueId)) return;
    // @ts-ignore
    $gameMap.eraseConnectedEvent(npc.uniqueId);
});

MMO_Core.socket.on('npc_moving', function (data) {
    if (!$gameMap || $gameMap._mapId !== data.mapId) return;
    // @ts-ignore
    if (!SceneManager._scene._spriteset || SceneManager._scene instanceof Scene_Battle) return;
    if (MMO_Core_Npcs.npcs[data.id] === undefined) return;

    // Update movement speed and frequenzy
    if (!data.skip) {
        MMO_Core_Npcs.npcs[data.id].setMoveSpeed(data.moveSpeed);
        MMO_Core_Npcs.npcs[data.id].setMoveFrequency(data.moveFrequency);
        MMO_Core_Npcs.npcs[data.id].moveStraight(data.direction);
    }
    if (MMO_Core_Npcs.npcs[data.id].x !== data.x || MMO_Core_Npcs.npcs[data.id].y !== data.y)
        MMO_Core_Npcs.npcs[data.id].setPosition(data.x, data.y);
});

export default MMO_Core_Npcs;