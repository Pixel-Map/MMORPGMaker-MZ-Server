import MMO_Core from '../../core/mmo_core';
import { Messages } from './messages';

export class JoinParty {
    mmoCore: MMO_Core;
    messages: Messages;

    constructor(messages: Messages) {
        this.mmoCore = messages.mmoCore;
        this.messages = messages;

        this.mmoCore.socket.serverEvent.on('player-joined-party', (payload) => {
            this.mmoCore.socket.modules.messages.sendToParty(
                payload.partyName,
                'System',
                `${payload.player.playerData.username} joined the party!`,
            );
        });
    }

    async use(args, initiator) {
        if (args.length <= 1) {
            return this.messages.sendToPlayer(initiator, 'System', 'Not enough arguments.', 'error');
        }
        const targetsName = args[1].toLowerCase();
        if (targetsName === initiator.playerData.username.toLowerCase()) {
            return this.messages.sendToPlayer(initiator, 'System', "You can't join your own party.", 'error');
        }
        if (initiator.isInParty) {
            return this.messages.sendToPlayer(initiator, 'System', 'You are already in a party.', 'error');
        }

        const players = await this.mmoCore.socket.modules.player.getPlayers(false);
        const target = players[targetsName];
        if (target === undefined) {
            return this.messages.sendToPlayer(initiator, 'System', 'Could not find the player.', 'error');
        }
        if (target.playerData.status === 'combat') {
            return this.messages.sendToPlayer(initiator, 'System', "You can't join a player in combat.", 'error');
        }

        // We check if the player we try to join is a party leader or not.
        if (target.isInParty) {
            const partyLeader = await this.mmoCore.socket.modules.player.party.getPartyLeader(target.isInParty);
            if (partyLeader.id !== target.id) {
                return this.messages.sendToPlayer(initiator, 'System', 'He is not the party leader.', 'error');
            }
        }

        this.mmoCore.socket.modules.player.party.joinParty(initiator, target);
    }
}
