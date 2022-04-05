import MMO_Core from '../../core/mmo_core';
import { Messages } from './messages';

export class LeaveParty {
    mmoCore: MMO_Core;
    messages: Messages;

    constructor(messages: Messages) {
        this.mmoCore = messages.mmoCore;
        this.messages = messages;

        this.mmoCore.socket.serverEvent.on('player-left-party', (payload) => {
            this.messages.sendToParty(
                payload.partyName,
                'System',
                `${payload.player.playerData.username} left the party!`,
            );
        });
    }

    async use(args, initiator) {
        if (initiator.isInParty === false) {
            return this.messages.sendToPlayer(initiator, 'System', 'You are not in a party.', 'error');
        }

        this.messages.sendToPlayer(initiator, 'System', 'You left the party!', 'action');
        await this.mmoCore.socket.modules.player.party.leaveParty(initiator);
    }
}
