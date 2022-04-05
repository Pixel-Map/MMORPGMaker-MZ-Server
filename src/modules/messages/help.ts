import MMO_Core from '../../core/mmo_core';
import { Messages } from './messages';

export class Help {
    messages: Messages;

    constructor(messages: Messages) {
        this.messages = messages;
    }

    async use(args, initiator) {
        this.messages.sendToPlayer(initiator, 'System', '---- Available commands :', 'action');
        this.messages.sendToPlayer(initiator, 'System', '/changePassword [old] [new]', 'action');
        this.messages.sendToPlayer(initiator, 'System', '/findUser [username]', 'action');
        this.messages.sendToPlayer(initiator, 'System', '/givegold [username] [amount]', 'action');
        this.messages.sendToPlayer(initiator, 'System', '/joinparty [username]', 'action');
        this.messages.sendToPlayer(initiator, 'System', '/leaveparty', 'action');
        this.messages.sendToPlayer(initiator, 'System', '/pa [message]', 'action');
        this.messages.sendToPlayer(initiator, 'System', '/w [username] [message]', 'action');

        if (initiator.permission > 50) {
            this.messages.sendToPlayer(initiator, 'System', '/kick [username]', 'action');
            this.messages.sendToPlayer(initiator, 'System', '/npc add [eventId] [mapId] [x] [y]', 'action');
            this.messages.sendToPlayer(initiator, 'System', '/npc remove [index]', 'action');
            this.messages.sendToPlayer(initiator, 'System', '/nodes', 'action');
        }
    }
}
