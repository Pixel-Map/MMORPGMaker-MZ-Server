import MMO_Core from '../../core/mmo_core';

import * as security from '../../core/security';

export class Auth {
    mmoCore: MMO_Core;

    constructor(mmoCore: MMO_Core) {
        this.mmoCore = mmoCore;
        const { socket, database } = mmoCore;
        const gameworld = mmoCore.gameworld;
        const io = socket.socketConnection;
        io.on('connect', (client) => {
            // Handle in-game user login and registration
            // Expect : data : {username, password (optional)}
            client.on('login', async (data) => {
                if (data.username === undefined) {
                    return this.loginError(client, 'Missing username');
                }
                if (data.password === undefined) {
                    return this.loginError(client, 'Missing password');
                }

                const user = await database.findUser(data);

                if (user == undefined) {
                    return this.loginError(client, 'Account does not exist');
                } else {
                    if (security.hashPassword(data.password.toLowerCase()) == user.password.toLowerCase()) {
                        const existingPlayer = await mmoCore.socket.modules.player.getPlayer(data.username);
                        if (existingPlayer !== null) {
                            return this.loginError(client, 'Player is already connected.');
                        }
                        return this.loginSuccess(client, user, mmoCore);
                    } else {
                        return this.loginError(client, 'Bad password!');
                    }
                }
            });

            client.on('register', async (data) => {
                // username validation
                function isValidUsername(string) {
                    return /^(?=[a-zA-Z0-9\s]{4,25}$)(?=[a-zA-Z0-9\s])(?:([\w\s*?])\1?(?!\1))+$/.test(string);
                }

                if (data.username === undefined) {
                    return this.loginError(client, 'Missing username');
                }
                if (data.username.includes(' ')) {
                    return this.loginError(client, "Pseudo can't contain spaces");
                }
                if (!isValidUsername(data.username)) {
                    return this.loginError(client, 'Incorrect username format');
                }
                // password validation
                if (data.password === undefined) {
                    return this.loginError(client, 'Missing password');
                }

                const user = await database.findUser(data);
                if (user !== undefined) {
                    return this.loginError(client, 'Cannot create this account.'); // Avoid telling user taken!
                } else {
                    // If user doesn't exist
                    await database.registerUser(data);
                    return this.registerSuccess(client);
                }
            });

            // Handle the disconnection of a player
            client.on('disconnect', async () => {
                if (client.lastMap === undefined) {
                    return;
                }

                gameworld.removeNode(gameworld.getNodeBy('playerId', client.playerData.id));
                gameworld.playerLeaveInstance(client.playerData.id, parseInt(client.playerData.mapId));

                // ANTI-CHEAT : Deleting some entries before saving the character.
                delete client.playerData.permission; // Avoid permission elevation exploit
                delete client.playerData.id; // Avoid account-spoofing
                delete client.playerData.isInCombat; // Sanitizing
                // client.playerData.isInCombat = false;

                mmoCore.logger.info(`${client.playerData.username} disconnected from the game.`, 'info');

                await database.savePlayer(client.playerData);
                client.broadcast.to(client.lastMap).emit('map_exited', client.id);
                client.leave(client.lastMap);
            });
        });
    }

    // ---------------------------------------
    // ---------- EXPOSED FUNCTIONS
    // ---------------------------------------

    saveWorld() {
        // To do : Save every players before closing the server
    }

    // ---------------------------------------
    // ---------- PRIVATE FUNCTIONS
    // ---------------------------------------

    // Connecting the player and storing datas locally
    loginSuccess(client, details, mmoCore: MMO_Core) {
        // We remove the things we don't want the user to see
        delete details.password;
        details.status = null;

        // Then we continue
        client.emit('login_success', { msg: details });
        client.playerData = details;
        mmoCore.gameworld.attachNode(client.playerData, true);
        mmoCore.logger.info(client.playerData.username + ' connected to the game');
    }

    // Sending error in case of failure at login
    loginError(client, message) {
        client.emit('login_error', { msg: message });
    }

    // Register user emitter
    registerSuccess(client) {
        client.emit('register_success', { msg: 'Account has been created !' });
        this.mmoCore.logger.info('New account has been created!');
    }
}
