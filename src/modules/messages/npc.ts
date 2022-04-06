import MMO_Core from '../../core/mmo_core';
import { Messages } from './messages';

export class Npc {
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

        const mode = args[1];
        const _print = (string) => this.messages.sendToPlayer(initiator, 'System', string, 'action');
        const _error = (string) => this.messages.sendToPlayer(initiator, 'System', string, 'error');

        if (mode === 'add' || mode === 'spawn' || mode === 'summon' || mode === 'a' || mode === 's') {
            const summonId = parseInt(args[2]);
            const coords = {
                mapId: parseInt(args[3]) || initiator.playerData.mapId,
                x: parseInt(args[4]) || initiator.playerData.x,
                y: parseInt(args[5]) || initiator.playerData.y,
            };
            const pageIndex = args[6] ? parseInt(args[6]) : 0;
            const summonedId = this.mmoCore.gameworld
                .spawnNpc(summonId, coords, pageIndex, initiator.playerData.id)
                .toString();

            if (summonedId) _print(`Spawned NPC [index: ${summonedId}]`);
            else _error(`NPC not found [index ${args[2]}]`);
        } else if (mode === 'remove' || mode === 'delete' || mode === 'rm' || mode === 'del') {
            const removedUniqueId = this.mmoCore.gameworld.removeSpawnedNpcByIndex(args[2]);

            if (removedUniqueId) _print(`You removed ${removedUniqueId} [index: ${args[2]}]`);
            else _error(`NPC not found [index ${args[2]}]`);
        } else {
            const idList = this.mmoCore.gameworld.spawnedUniqueIds;
            if (idList && idList.length) {
                _print('/npc = (index, coordinates, uniqueId) =>');
                this.mmoCore.logger.info('/npc => [');
                for (const index in idList) {
                    const _npc = this.mmoCore.gameworld.getNpcByUniqueId(idList[index]);
                    if (_npc) {
                        const mapId = _npc.mapId;
                        const x = _npc.x;
                        const y = _npc.y;
                        _print(`[${index}] (${mapId},${x},${y}) ${idList[index]}`);
                        this.mmoCore.logger.trace(_npc);
                    }
                }
            } else _error('/npc = (index, coordinates, uniqueId) => NONE');
        }
    }
}
