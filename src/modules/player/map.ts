import MMO_Core from '../../core/mmo_core';
import { PocketEvent } from '../../entities/PocketEvent';

export class Map {
    mmoCore: MMO_Core;

    constructor(mmoCore: MMO_Core) {
        this.mmoCore = mmoCore;
        const { socket, database } = mmoCore;
        const gameworld = mmoCore.gameworld;
        const io = socket.socketConnection;

        io.on('connect', (client) => {
            // Handle players joining a map
            client.on('map_joined', async (playerData) => {
                if (client.playerData === undefined) {
                    return;
                }

                if (client.lastMap !== undefined && client.lastMap !== 'map-' + playerData.mapId) {
                    if (database.SERVER_CONFIG.offlineMaps[client.lastMap] === undefined) {
                        client.broadcast.to(client.lastMap).emit('map_exited', client.id);
                    }
                    client.leave(client.lastMap);
                    gameworld.playerLeaveInstance(client.playerData.id, parseInt(client.playerData.mapId));

                    this.mmoCore.logger.debug(client.playerData.username + ' left ' + client.lastMap);
                }
                playerData.ens = client.playerData.ens;
                playerData.username = client.playerData.username; // Temporary way to pass the username
                playerData.skin = client.playerData.skin;

                // Storing the new location (in case of disconnecting on a local map)
                client.playerData.x = playerData.x;
                client.playerData.y = playerData.y;
                client.playerData.mapId = parseInt(playerData.mapId);

                // Update global switches
                for (const switchKey in database.SERVER_CONFIG.globalSwitches) {
                    client.emit('player_update_switch', {
                        switchId: switchKey,
                        value: database.SERVER_CONFIG.globalSwitches[switchKey],
                    });
                }

                // Update global variables
                for (const varKey in database.SERVER_CONFIG.globalVariables) {
                    client.emit('player_update_variable', {
                        variableId: varKey,
                        value: database.SERVER_CONFIG.globalVariables[varKey],
                    });
                }

                client.join('map-' + playerData.mapId);
                client.lastMap = 'map-' + playerData.mapId;
                gameworld.playerJoinInstance(client.playerData.id, parseInt(client.playerData.mapId));

                if (database.SERVER_CONFIG.offlineMaps[client.lastMap] === undefined) {
                    client.broadcast.to('map-' + playerData.mapId).emit('map_joined', {
                        id: client.id,
                        playerData: playerData,
                    });
                    client.broadcast.to('map-' + playerData.mapId).emit('refresh_players_position', client.id);
                }

                const npcs = gameworld.getConnectedNpcs(parseInt(client.playerData.mapId));
                if (npcs && npcs.length) {
                    client.emit('npcsFetched', {
                        playerId: client.playerData.id,
                        npcs,
                    });
                }

                this.mmoCore.logger.info(client.playerData.username + ' joined ' + client.lastMap);
            });

            // Refresh position of players when map joined
            client.on('refresh_players_position', (data) => {
                if (client.playerData === undefined) {
                    return;
                }

                if (database.SERVER_CONFIG.offlineMaps[client.lastMap] !== undefined) {
                    return false;
                }

                this.mmoCore.logger.debug(client.playerData.username + ' transmitted its position to ' + data.id);

                data.playerData.username = client.playerData.username; // Temporary way to pass the username
                data.playerData.skin = client.playerData.skin;
                data.playerData.status = client.playerData.status;
                data.playerData.ens = client.playerData.ens;
                client.broadcast.to(data.id).emit('map_joined', {
                    id: client.id,
                    playerData: data.playerData,
                });
            });

            // Refresh single player on map
            client.on('refresh_players_on_map', function () {
                if (client.playerData === undefined) {
                    return;
                }

                client.broadcast.to('map-' + client.playerData.mapId).emit('refresh_players_on_map', {
                    playerId: client.id,
                    playerData: client.playerData,
                });
            });

            client.on('start_interact_npc', function (npc) {
                if (npc && npc.uniqueId) {
                    gameworld.setNpcBusyStatus(npc.uniqueId, {
                        id: client.playerData.id,
                        type: 'player',
                        since: new Date(),
                    });
                }
            });
            client.on('stop_interact_npc', function (npc) {
                if (npc && npc.uniqueId) {
                    gameworld.setNpcBusyStatus(npc.uniqueId, false);
                }
            });
            client.on('event_placed', function (event: PocketEvent) {
                const uniqueIntegerId = 99999 + Math.floor(Math.random() * 99999); // Prevents event id conflicts
                const uniqueId = `Npc${uniqueIntegerId}#${gameworld.getConnectedNpcs(event.mapId).length}@${
                    event.mapId
                }`;
                event.uniqueId = uniqueId;
                gameworld.spawnPocketEvent(event);
            });
            client.on('event_removed', function (event) {
                gameworld.removeConnectedNpcByUniqueId(event.uniqueId, true);
            });
        });
    }
}
