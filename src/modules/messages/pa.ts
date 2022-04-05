import MMO_Core from '../../core/mmo_core';
import { Messages } from './messages';

export class Pa {
    mmoCore: MMO_Core;
    messages: Messages;

    constructor(messages: Messages) {
        this.mmoCore = messages.mmoCore;
        this.messages = messages;
    }

    async use(args, player) {
        if (args.length <= 1) {
            return this.messages.sendToPlayer(player, 'System', 'Not enough arguments.', 'error');
        }
        if (player.isInParty === false) {
            return this.messages.sendToPlayer(player, 'System', 'You are not in a party.', 'error');
        }

        let message = '';
        const playerName = player.isInParty;

        for (let i = 1; i < args.length; i++) {
            message = message + ' ' + args[i];
        }

        this.messages.sendToParty(playerName, '(Party) ' + player.playerData.username, message);
    }
}
