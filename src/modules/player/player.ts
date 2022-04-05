import MMO_Core from '../../core/mmo_core';
import { wrap } from '@mikro-orm/core';
import Socket from '../../core/socket';
import { Auth } from './auth';
import { Map } from './map';
import { Party } from './party';

export class Player {
    auth: Auth;
    map: Map;
    party: Party;
    mmoCore: MMO_Core;
    socket: Socket;

    constructor(mmoCore: MMO_Core) {
        // Initialize Children
        this.auth = new Auth(mmoCore);
        this.map = new Map(mmoCore);
        this.party = new Party(mmoCore);

        this.mmoCore = mmoCore;
        const { socket, database } = mmoCore;
        this.socket = socket;
        const gameworld = mmoCore.gameworld;
        const io = socket.socketConnection;

        io.on('connect', (client) => {
            client.on('player_update_switches', function (payload) {
                if (client.playerData === undefined) {
                    return;
                }

                client.playerData.switches = payload;
            });

            client.on('player_global_switch_check', (payload) => {
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

            client.on('player_update_stats', async (payload) => {
                if (client.playerData === undefined) {
                    return;
                }
                console.log(payload);
                wrap(client.playerData.stats).assign({ ...payload }, { mergeObjects: true });
                await database.savePlayer(client.playerData);
                await this.refreshData(client);
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
    }
    // ---------------------------------------
    // ---------- EXPOSED FUNCTIONS
    // ---------------------------------------

    async getPlayers(spaceName) {
        spaceName = spaceName || false;
        const sockets = await this.socket.getConnectedSockets(spaceName);
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
    }

    async getPlayer(username) {
        const players = await this.getPlayers(false);
        return players[username.toLowerCase()] || null;
    }

    async getPlayerById(socketId) {
        return this.socket.socketConnection.sockets.connected[socketId];
    }

    async refreshData(player) {
        const playerData = await this.mmoCore.database.findUserById(player.playerData.id);
        delete playerData.password; // We delete the password from the result sent back

        player.emit('refresh_player_data', playerData, () => {
            if (!player.isInParty) {
                return;
            }

            this.socket.modules.player.party.refreshPartyData(player.isInParty);
        });
    }
}
