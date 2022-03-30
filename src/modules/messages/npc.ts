import MMO_Core from '../../core/mmo_core';

exports.initialize = function (mmoCore: MMO_Core) {
    const { socket } = mmoCore;
    const gameworld = mmoCore.gameworld;
    exports.use = async function (args, initiator) {
        if (initiator.playerData.permission < 100) {
            return socket.modules.messages.sendToPlayer(
                initiator,
                'System',
                "You don't have the permission to use this command.",
                'error',
            );
        }
        if (args.length < 1) {
            return socket.modules.messages.sendToPlayer(initiator, 'System', 'Not enough arguments.', 'error');
        }
        if (!gameworld.getSummonMap()) {
            return socket.modules.messages.sendToPlayer(initiator, 'System', 'The server has no spawnMap.', 'error');
        }

        const mode = args[1];
        const _print = (string) => socket.modules.messages.sendToPlayer(initiator, 'System', string, 'action');
        const _error = (string) => socket.modules.messages.sendToPlayer(initiator, 'System', string, 'error');

        if (mode === 'add' || mode === 'spawn' || mode === 'summon' || mode === 'a' || mode === 's') {
            const summonId = parseInt(args[2]);
            const coords = {
                mapId: parseInt(args[3]) || initiator.playerData.mapId,
                x: parseInt(args[4]) || initiator.playerData.x,
                y: parseInt(args[5]) || initiator.playerData.y,
            };
            const pageIndex = args[6] ? parseInt(args[6]) : 0;
            const summonedId = gameworld.spawnNpc(summonId, coords, pageIndex, initiator.playerData.id).toString();

            if (summonedId) _print(`Spawned NPC [index: ${summonedId}]`);
            else _error(`NPC not found [index ${args[2]}]`);
        } else if (mode === 'remove' || mode === 'delete' || mode === 'rm' || mode === 'del') {
            const removedUniqueId = gameworld.removeSpawnedNpcByIndex(args[2]);

            if (removedUniqueId) _print(`You removed ${removedUniqueId} [index: ${args[2]}]`);
            else _error(`NPC not found [index ${args[2]}]`);
        } else {
            const idList = gameworld.spawnedUniqueIds;
            if (idList && idList.length) {
                _print('/npc = (index, coordinates, uniqueId) =>');
                console.log('/npc => [');
                for (const index in idList) {
                    const _npc = gameworld.getNpcByUniqueId(idList[index]);
                    if (_npc) {
                        const mapId = _npc.mapId;
                        const x = _npc.x;
                        const y = _npc.y;
                        _print(`[${index}] (${mapId},${x},${y}) ${idList[index]}`);
                        console.log(_npc);
                    }
                }
                console.log(']');
            } else _error('/npc = (index, coordinates, uniqueId) => NONE');
        }
    };
};
