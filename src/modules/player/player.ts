import MMO_Core from '../../core/mmo_core';
import { wrap } from '@mikro-orm/core';

exports.initialize = function (mmoCore: MMO_Core) {
    const { socket, database } = mmoCore;
    const gameworld = mmoCore.gameworld;
    const io = socket.socketConnection;

    io.on('connect', function (client) {
        client.on('player_update_switches', function (payload) {
            if (client.playerData === undefined) {
                return;
            }

            client.playerData.switches = payload;
        });

        client.on('player_global_switch_check', function (payload) {
            if (client.playerData === undefined) {
                return;
            }

            // If the player is in a party
            if (client.isInParty) {
                if (database.SERVER_CONFIG.partySwitches[payload.switchId] !== undefined) {
                    io.in(client.isInParty).emit('player_update_switch', payload);
                    return;
                }
            }

            if (database.SERVER_CONFIG.globalSwitches[payload.switchId] === undefined) {
                return;
            }

            database.SERVER_CONFIG.globalSwitches[payload.switchId] = payload.value;
            database.saveConfig();

            client.broadcast.emit('player_update_switch', payload);
        });

        client.on('player_update_variables', function (payload) {
            if (client.playerData === undefined) {
                return;
            }

            client.playerData.variables = payload;
        });

        client.on('player_global_variables_check', function (payload) {
            if (client.playerData === undefined) {
                return;
            }

            if (database.SERVER_CONFIG.globalVariables[payload.variableId] === undefined) {
                return;
            }

            database.SERVER_CONFIG.globalVariables[payload.variableId] = payload.value;
            database.saveConfig();

            client.broadcast.emit('player_update_variable', payload);
        });

        client.on('player_update_stats', async function (payload) {
            if (client.playerData === undefined) {
                return;
            }
            wrap(client.playerData.stats).assign({ ...payload }, { mergeObjects: true });
            await database.savePlayer(client.playerData);
            exports.refreshData(client);
        });

        client.on('player_update_skin', function (payload) {
            if (client.playerData === undefined) {
                return;
            }

            switch (payload.type) {
                case 'sprite':
                    client.playerData.skin.characterName = payload.characterName;
                    client.playerData.skin.characterIndex = payload.characterIndex;
                    break;
                case 'face':
                    client.playerData.skin.faceName = payload.faceName;
                    client.playerData.skin.faceIndex = payload.faceIndex;
                    break;
                case 'battler':
                    client.playerData.skin.battlerName = payload.battlerName;
                    break;
            }
        });

        client.on('player_update_status', async (payload) => {
            if (client.playerData === undefined) {
                return;
            }
            if (client.playerData.status === payload) {
                return;
            }

            client.playerData.status = payload;
            await database.savePlayer({
                username: client.playerData.username,
                status: client.playerData.status,
            });
            client.broadcast.to('map-' + client.playerData.mapId).emit('refresh_players_on_map', {
                playerId: client.id,
                playerData: client.playerData,
            });
        });

        client.on('player_moving', function (payload) {
            if (client.playerData === undefined) {
                return;
            }

            if (database.SERVER_CONFIG.offlineMaps[client.lastMap] !== undefined) {
                return false;
            }

            payload.id = client.id;

            client.playerData.x = payload.x;
            client.playerData.y = payload.y;
            client.playerData.mapId = payload.mapId;

            gameworld.mutateNode(gameworld.getNodeBy('playerId', client.playerData.id), {
                x: client.playerData.x,
                y: client.playerData.y,
                mapId: client.playerData.mapId,
            });

            client.broadcast.to(client.lastMap).emit('player_moving', payload);
        });

        client.on('player_dead', function () {
            if (client.playerData === undefined) {
                return;
            }

            client.emit('player_respawn', {
                mapId: database.SERVER_CONFIG.newPlayerDetails.mapId,
                x: database.SERVER_CONFIG.newPlayerDetails.x,
                y: database.SERVER_CONFIG.newPlayerDetails.y,
            });
        });
    });

    // ---------------------------------------
    // ---------- EXPOSED FUNCTIONS
    // ---------------------------------------

    exports.getPlayers = async function (spaceName) {
        spaceName = spaceName || false;
        const sockets = await socket.getConnectedSockets(spaceName);
        const players = {};
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        for (let i = 0; i < sockets.length; i++) {
            if (!sockets[i].playerData) {
                continue;
            }

            players[sockets[i].playerData.username.toLowerCase()] = sockets[i];
        }
        return players;
    };

    exports.getPlayer = async function (username) {
        const players = await exports.getPlayers();
        return players[username.toLowerCase()] || null;
    };

    exports.getPlayerById = async function (socketId) {
        return io.sockets.connected[socketId];
    };

    exports.refreshData = async (client) => {
        const playerData = await database.findUserById(client.playerData.id);
        delete playerData.password; // We delete the password from the result sent back

        client.emit('refresh_player_data', playerData, () => {
            if (!client.isInParty) {
                return;
            }

            socket.modules.player.subs.party.refreshPartyData(client.isInParty);
        });
    };
};
