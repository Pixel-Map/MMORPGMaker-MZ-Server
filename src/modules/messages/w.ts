import MMO_Core from '../../core/mmo_core';
import Socket from '../../core/socket';
import { Messages } from './messages';

export class W {
    mmoCore: MMO_Core;
    messages: Messages;

    constructor(messages: Messages) {
        this.mmoCore = messages.mmoCore;
        this.messages = messages;
    }

    async use(args, player) {
        if (args.length <= 2) {
            return this.messages.sendToPlayer(player, 'System', 'Not enough arguments.', 'error');
        }

        const players = await this.mmoCore.socket.modules.player.getPlayers(false);
        const targetsName = args[1].toLowerCase();
        if (players[targetsName] === undefined) {
            return this.messages.sendToPlayer(player, 'System', 'Could not find the player.', 'error');
        }

        let message = '';
        for (let i = 2; i < args.length; i++) {
            message = message + ' ' + args[i];
        }

        this.messages.sendToPlayer(player, '(Whisp) ' + player.playerData.username, message, 'whisper');
        this.messages.sendToPlayer(players[targetsName], '(Whisp) ' + player.playerData.username, message, 'whisper');
    }
}
