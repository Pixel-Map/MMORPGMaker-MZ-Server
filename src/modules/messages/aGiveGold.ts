import MMO_Core from '../../core/mmo_core';
import { Messages } from './messages';

export class aGiveGold {
    mmoCore: MMO_Core;
    messages: Messages;

    constructor(messages: Messages) {
        this.mmoCore = messages.mmoCore;
        this.messages = messages;
    }

    async use(args, initiator) {
        if (args.length <= 2) {
            return this.messages.sendToPlayer(initiator, 'System', 'Not enough arguments.', 'error');
        }
        if (initiator.playerData.permission < 100) {
            return this.messages.sendToPlayer(
                initiator,
                'System',
                "You don't have the permission to use this command.",
                'error',
            );
        }

        const players = await this.mmoCore.socket.modules.player.getPlayers(false);
        const targetsName = args[1].toLowerCase();

        if (players[targetsName] === undefined) {
            return this.messages.sendToPlayer(initiator, 'System', 'Could not find the player.', 'error');
        }
        if (isNaN(args[2])) {
            return this.messages.sendToPlayer(initiator, 'System', 'Amount is not valid.', 'error');
        }
        if (args[2] > 1000000) {
            return this.messages.sendToPlayer(initiator, 'System', 'Amount is above 1,000,000.', 'error');
        }

        this.messages.sendToPlayer(
            initiator,
            'System',
            `You gave ${args[2]} gold to ${players[targetsName].playerData.username}!`,
            'action',
        );
        players[targetsName].playerData.stats.gold += parseInt(args[2]);

        // We save the new datas
        await this.mmoCore.database.savePlayer({
            username: players[targetsName].playerData.username,
            stats: players[targetsName].playerData.stats,
        });
        await this.mmoCore.socket.modules.player.refreshData(players[targetsName]);
        this.mmoCore.socket.modules.messages.sendToPlayer(
            players[targetsName],
            'System',
            `${initiator.playerData.username} gave you ${args[2]} gold!`,
            'action',
        );
    }
}
