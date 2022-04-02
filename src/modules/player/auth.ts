import MMO_Core from '../../core/mmo_core';

exports.initialize = function (mmoCore: MMO_Core) {
    const security = require('../../core/security');
    const gameworld = mmoCore.gameworld;
    const io = mmoCore.socket.socketConnection;
    const database = mmoCore.database;

    io.on('connect', function (client) {
        // Handle in-game user login and registration
        // Expect : data : {username, password (optional)}
        client.on('login', async (data) => {
            if (data.username === undefined) {
                return loginError(client, 'Missing username');
            }
            if (database.SERVER_CONFIG.passwordRequired && data.password === undefined) {
                return loginError(client, 'Missing password');
            }

            const user = await database.findUser(data);

            if (user == undefined) {
                return loginError(client, 'Account does not exist');
            } else {
                console.log(user.password + ' vs. ' + security.hashPassword(data.password.toLowerCase()));
                if (security.hashPassword(data.password.toLowerCase()) == user.password.toLowerCase()) {
                    const existingPlayer = await mmoCore.socket.modules.player.subs.player.getPlayer(data.username);
                    if (existingPlayer !== null) {
                        return loginError(client, 'Player is already connected.');
                    }
                    return loginSuccess(client, user, mmoCore);
                } else {
                    return loginError(client, 'Bad password!');
                }
            }
        });

        client.on('register', async (data) => {
            // username validation
            function isValidUsername(string) {
                return /^(?=[a-zA-Z0-9\s]{4,25}$)(?=[a-zA-Z0-9\s])(?:([\w\s*?])\1?(?!\1))+$/.test(string);
            }

            if (data.username === undefined) {
                return loginError(client, 'Missing username');
            }
            if (data.username.includes(' ')) {
                return loginError(client, "Pseudo can't contain spaces");
            }
            if (!isValidUsername(data.username)) {
                return loginError(client, 'Incorrect username format');
            }
            // password validation
            if (database.SERVER_CONFIG.passwordRequired && data.password === undefined) {
                return loginError(client, 'Missing password');
            }

            const user = await database.findUser(data);
            if (user !== undefined) {
                return loginError(client, 'Cannot create this account.'); // Avoid telling that username is taken !
            } else {
                // If user doesn't exist
                await database.registerUser(data);
                return registerSuccess(client);
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

            security.createLog(`${client.playerData.username} disconnected from the game.`);

            await database.savePlayer(client.playerData);
            client.broadcast.to(client.lastMap).emit('map_exited', client.id);
            client.leave(client.lastMap);
        });
    });
};

// ---------------------------------------
// ---------- EXPOSED FUNCTIONS
// ---------------------------------------

exports.saveWorld = function () {
    // To do : Save every players before closing the server
};

// ---------------------------------------
// ---------- PRIVATE FUNCTIONS
// ---------------------------------------

// Connecting the player and storing datas locally
function loginSuccess(client, details, mmoCore: MMO_Core) {
    console.log(details);
    const security = require('../../core/security');
    // We remove the things we don't want the user to see
    delete details.password;
    details.status = null;

    // Then we continue
    client.emit('login_success', { msg: details });
    client.playerData = details;
    mmoCore.gameworld.attachNode(client.playerData, true);
    security.createLog(client.playerData.username + ' connected to the game');
}

// Sending error in case of failure at login
function loginError(client, message) {
    client.emit('login_error', { msg: message });
}

// Register user emitter
function registerSuccess(client) {
    client.emit('register_success', { msg: 'Account has been created !' });
}
