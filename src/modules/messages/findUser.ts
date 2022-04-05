import MMO_Core from '../../core/mmo_core';
import { Messages } from './messages';

export class FindUser {
    mmoCore: MMO_Core;
    messages: Messages;

    constructor(messages: Messages) {
        this.mmoCore = messages.mmoCore;
        this.messages = messages;
    }

    async use(args, initiator) {
        const players = await this.mmoCore.socket.modules.player.getPlayers(false);

        if (args.length === 1) {
            return this.messages.sendToPlayer(
                initiator,
                'System',
                `There is ${Object.keys(players).length} person(s) online now!`,
                'action',
            );
        }

        const targetsName = args[1].toLowerCase();
        if (players[targetsName] === undefined) {
            return this.messages.sendToPlayer(initiator, 'System', 'Could not find the user.', 'error');
        }

        return this.messages.sendToPlayer(
            initiator,
            'System',
            `${players[targetsName].playerData.username} is level ${players[targetsName].playerData.stats.level}!`,
            'action',
        );
    }
}
