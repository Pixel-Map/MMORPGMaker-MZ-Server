import MMO_Core from '../../core/mmo_core.js';
import { aGive } from './aGive';
import { aGiveGold } from './aGiveGold';
import { FindUser } from './findUser';
import { GiveGold } from './givegold';
import { World } from './world';
import { ChangePassword } from './changePassword';
import { Help } from './help';
import { JoinParty } from './joinparty';
import { Kick } from './kick';
import { LeaveParty } from './leaveparty';
import { Nodes } from './nodes';
import { Npc } from './npc';
import { Pa } from './pa';
import { W } from './w';

export class Messages {
    mmoCore: MMO_Core;
    io;
    COLOR_PARTY = '#41BFEF';
    COLOR_WHISPER = '#9762DC';
    COLOR_ERROR = '#ff0000';
    COLOR_ACTION = '#ffff00';
    COLOR_GLOBAL = '#009933';
    COLOR_NORMAL = '#F8F8F8';

    // Children
    world: World;
    aGive: aGive;
    aGiveGold: aGiveGold;
    changePassword: ChangePassword;
    findUser: FindUser;
    giveGold: GiveGold;
    help: Help;
    joinParty: JoinParty;
    kick: Kick;
    leaveParty: LeaveParty;
    nodes: Nodes;
    npc: Npc;
    pa: Pa;
    w: W;

    constructor(mmoCore: MMO_Core) {
        this.mmoCore = mmoCore;
        const { socket } = mmoCore;
        const io = socket.socketConnection;
        this.io = io;

        // Initialize Children
        this.aGive = new aGive(this);
        this.aGiveGold = new aGiveGold(this);
        this.findUser = new FindUser(this);
        this.giveGold = new GiveGold(this);
        this.world = new World(this);
        this.changePassword = new ChangePassword(this);
        this.help = new Help(this);
        this.joinParty = new JoinParty(this);
        this.kick = new Kick(this);
        this.leaveParty = new LeaveParty(this);
        this.nodes = new Nodes(this);
        this.npc = new Npc(this);
        this.pa = new Pa(this);
        w: new W(this);

        io.on('connect', (client) => {
            client.on('new_message', (message) => {
                if (client.playerData === undefined) {
                    return;
                }

                if (message.indexOf('/') === 0) {
                    return this.checkCommand(message.substr(1, message.length), client);
                }

                this.sendToMap(client.lastMap, client.playerData.username, message, client.id);
            });
        });
    }
    // ---------------------------------------
    // ---------- EXPOSED FUNCTIONS
    // ---------------------------------------

    sendToMap(map, username, message, senderId) {
        const payload = {
            username: username,
            msg: message,
            color: this.COLOR_NORMAL,
        };
        if (senderId) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            payload.senderId = senderId;
        }

        this.io.in(map).emit('new_message', payload);
    }

    sendToAll(username, message, messageType) {
        let color = this.COLOR_GLOBAL;
        if (messageType === 'error') {
            color = this.COLOR_ERROR;
        }

        this.io.emit('new_message', {
            username: username,
            msg: message,
            color: color,
        });
    }

    sendToPlayer(player, username, message, messageType) {
        let color = this.COLOR_NORMAL;
        if (messageType === 'error') {
            color = this.COLOR_ERROR;
        }
        if (messageType === 'whisper') {
            color = this.COLOR_WHISPER;
        }
        if (messageType === 'action') {
            color = this.COLOR_ACTION;
        }

        player.emit('new_message', {
            username: username,
            msg: message,
            color: color,
        });
    }

    sendToParty(partyName, username, message) {
        this.io.in(partyName).emit('new_message', {
            username: username,
            msg: message,
            color: this.COLOR_PARTY,
        });
    }

    // ---------------------------------------
    // ---------- PRIVATE FUNCTIONS
    // ---------------------------------------

    private checkCommand(command, player) {
        const args = command.split(' ');

        for (const existingCommand in this.mmoCore.socket.modules.messages) {
            if (args[0].toLowerCase() !== existingCommand.toLowerCase()) {
                continue;
            }

            this.mmoCore.socket.modules.messages[existingCommand].use(args, player);
        }
    }
}
