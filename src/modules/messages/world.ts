import MMO_Core from '../../core/mmo_core';
import { Messages } from './messages';

export class World {
    mmoCore: MMO_Core;

    constructor(messages: Messages) {
        this.mmoCore = messages.mmoCore;
    }

    async use(args, player) {
        if (args.length <= 1) {
            return this.mmoCore.socket.modules.messages.sendToPlayer(
                player,
                'System',
                'Not enough arguments.',
                'error',
            );
        }

        let message = '';
        for (let i = 1; i < args.length; i++) {
            message = message + ' ' + args[i];
        }

        this.mmoCore.socket.modules.messages.sendToAll('(World) ' + player.playerData.username, message, 'global');
    }
}
