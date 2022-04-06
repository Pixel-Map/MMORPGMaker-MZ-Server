import MMO_Core from './mmo_core';
import EventEmitter from 'events';
import { Player } from '../modules/player/player';
import { Banks } from '../modules/banks/banks';
import { Messages } from '../modules/messages/messages';

export default class Socket {
    public socketConnection: any;
    public serverEvent: any;
    public modules: {
        player: Player;
        banks: Banks;
        messages: Messages;
    };

    constructor() {
        this.serverEvent = new EventEmitter();
    }

    async initialize(socketConnection, mmoCore: MMO_Core) {
        this.socketConnection = socketConnection;
        this.modules = {
            player: new Player(mmoCore),
            banks: new Banks(mmoCore),
            messages: new Messages(mmoCore),
        };
        mmoCore.logger.info(`[I] Socket.IO server started on port ${process.env.PORT ? process.env.PORT : 8097}...`);
    }

    // Return all connected sockets to the world or specific room (map-* OR party-*)
    getConnectedSockets(roomName) {
        return new Promise((resolve) => {
            const sockets = [];
            const ns = this.socketConnection.of('/');

            for (const id in ns.connected) {
                if (roomName) {
                    const index = ns.connected[id].rooms.indexOf(roomName);
                    if (index !== -1) {
                        sockets.push(ns.connected[id]);
                    }
                } else {
                    sockets.push(ns.connected[id]);
                }
            }

            return resolve(sockets);
        });
    }

    // Send a socket to the entire server
    emitToAll(name, payload) {
        this.socketConnection.emit(name, payload);
    }
}
