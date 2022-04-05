import MMO_Core from '../../core/mmo_core';
import { Messages } from './messages';

export class GiveGold {
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

        const targetsName = args[1].toLowerCase();
        if (targetsName === initiator.playerData.username) {
            return this.messages.sendToPlayer(initiator, 'System', "You can't give money to yourself.", 'error');
        }
        if (isNaN(args[2])) {
            return this.messages.sendToPlayer(initiator, 'System', 'Amount is not valid.', 'error');
        }
        if (args[2] > initiator.playerData.stats.gold) {
            return this.messages.sendToPlayer(initiator, 'System', 'Amount is not valid.', 'error');
        }

        const players = await this.mmoCore.socket.modules.player.getPlayers(false);

        if (players[targetsName] === undefined) {
            return this.messages.sendToPlayer(initiator, 'System', 'Could not find the player.', 'error');
        }

        initiator.playerData.stats.gold -= parseInt(args[2]);
        players[targetsName].playerData.stats.gold += parseInt(args[2]);

        // We save the new datas
        await this.mmoCore.database.savePlayer({
            username: initiator.playerData.username,
            stats: initiator.playerData.stats,
        });
        await this.mmoCore.socket.modules.player.refreshData(initiator); // We ask to refresh the data of the player
        this.messages.sendToPlayer(
            initiator,
            'System',
            `You gave ${args[2]} gold to ${players[targetsName].playerData.username}!`,
            'action',
        );

        // Same for the receiving
        await this.mmoCore.database.savePlayer({
            username: players[targetsName].playerData.username,
            stats: players[targetsName].playerData.stats,
        });
        await this.mmoCore.socket.modules.player.refreshData(players[targetsName]);
        this.messages.sendToPlayer(
            players[targetsName],
            'System',
            `${initiator.playerData.username} gave you ${args[2]} gold!`,
            'action',
        );
    }
}
