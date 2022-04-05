import MMO_Core from '../../core/mmo_core';
import { Messages } from './messages';

export class Kick {
    mmoCore: MMO_Core;
    messages: Messages;

    constructor(messages: Messages) {
        this.mmoCore = messages.mmoCore;
        this.messages = messages;
    }

    async use(args, initiator) {
        if (args.length <= 1) {
            return this.messages.sendToPlayer(initiator, 'System', 'Not enough arguments.', 'error');
        }
        if (initiator.playerData.permission < 50) {
            return this.messages.sendToPlayer(
                initiator,
                'System',
                "You don't have the permission to kick a player.",
                'error',
            );
        }

        const players = await this.mmoCore.socket.modules.player.getPlayers(false);
        const targetsName = args[1].toLowerCase();

        if (players[targetsName] === undefined) {
            return this.messages.sendToPlayer(initiator, 'System', 'Could not find the player.', 'error');
        }

        this.messages.sendToAll('System', `${players[targetsName].playerData.username} was kicked!`, 'error');
        return players[targetsName].disconnect();
    }
}
