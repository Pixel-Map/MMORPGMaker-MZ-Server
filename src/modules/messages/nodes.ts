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

        const _print = (string) => socket.modules.messages.sendToPlayer(initiator, 'System', string, 'action');
        const nodes = await gameworld.nodes;
        if (nodes && nodes.length) {
            _print('/nodes = (coordinates, id) =>');
            console.log('/nodes => [');
            for (const node of nodes) {
                const mapId = node.mapId >= 0 ? node.mapId.toString() : '';
                const x = node.x >= 0 ? node.x.toString() : '';
                const y = node.y >= 0 ? node.y.toString() : '';
                const coords = (mapId && x && y && ` [${mapId},${x},${y}]`) || '[WORLD]';
                _print(`${coords} ${node.playerId || node.npcUniqueId || node.instanceUniqueId || node.uniqueId}`);
                console.log(node);
            }
            console.log(']');
        } else Error('/nodes = (coordinates, id) => NONE');
    };
};
