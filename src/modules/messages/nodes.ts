import MMO_Core from '../../core/mmo_core';
import { Messages } from './messages';

export class Nodes {
    mmoCore: MMO_Core;
    messages: Messages;

    constructor(messages: Messages) {
        this.mmoCore = messages.mmoCore;
        this.messages = messages;
    }

    async use(args, initiator) {
        if (initiator.playerData.permission < 100) {
            return this.messages.sendToPlayer(
                initiator,
                'System',
                "You don't have the permission to use this command.",
                'error',
            );
        }
        if (args.length < 1) {
            return this.messages.sendToPlayer(initiator, 'System', 'Not enough arguments.', 'error');
        }
        if (!this.mmoCore.gameworld.getSummonMap()) {
            return this.messages.sendToPlayer(initiator, 'System', 'The server has no spawnMap.', 'error');
        }

        const _print = (string) => this.messages.sendToPlayer(initiator, 'System', string, 'action');
        const nodes = this.mmoCore.gameworld.nodes;
        if (nodes && nodes.length) {
            _print('/nodes = (coordinates, id) =>');
            this.mmoCore.logger.info('/nodes => [');
            for (const node of nodes) {
                const mapId = node.mapId >= 0 ? node.mapId.toString() : '';
                const x = node.x >= 0 ? node.x.toString() : '';
                const y = node.y >= 0 ? node.y.toString() : '';
                const coords = (mapId && x && y && ` [${mapId},${x},${y}]`) || '[WORLD]';
                _print(`${coords} ${node.playerId || node.npcUniqueId || node.instanceUniqueId || node.uniqueId}`);
            }
        } else Error('/nodes = (coordinates, id) => NONE');
    }
}
