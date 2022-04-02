import MMO_Core from './mmo_core';

import fs from 'fs';
import EventEmitter from 'events';
const fsPromises = fs.promises;

export default class Socket {
    public socketConnection: any;
    public serverEvent: any;
    public modules: any;

    constructor() {
        this.serverEvent = new EventEmitter();
        this.modules = {};
    }

    async initialize(socketConnection, mmoCore: MMO_Core) {
        this.socketConnection = socketConnection;
        // We load all the modules in the socket server
        await this.loadModules('', false, mmoCore);
        console.log(`[I] Socket.IO server started on port ${process.env.PORT ? process.env.PORT : 8097}...`);
    }

    async loadModules(path, isSub, mmoCore: MMO_Core) {
        if (isSub && this.modules[path].subs === undefined) {
            this.modules[path].subs = {};
        }

        const modulePath = isSub ? this.modules[path].subs : this.modules;
        const correctedPath = `${__dirname}/../modules/${path}`;
        let files = [];
        try {
            files = await fsPromises.readdir(correctedPath);
        } catch (err) {
            return err;
        }
        files = files.filter((fileName) => {
            if (fileName.includes('.ts')) {
                return fileName;
            }
        });

        for (const file of files) {
            const stats = fs.statSync(`${correctedPath}/${file}`);
            const moduleName = file.split('.')[0];

            if (!stats.isDirectory()) {
                modulePath[moduleName] = require(`${correctedPath}/${file}`);

                if (Object.keys(files).length === Object.keys(modulePath).length) {
                    console.log(`[I] Loaded ${Object.keys(modulePath).length} modules.`);

                    for (const key in modulePath) {
                        if (typeof modulePath[key] === 'function') {
                            continue;
                        }

                        modulePath[key].initialize(mmoCore);
                        console.log(`[I] Module ${key} initialized.`);
                    }
                }
            }
        }
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
