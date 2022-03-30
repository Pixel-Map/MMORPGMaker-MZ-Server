"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = function (mmoCore) {
    var security = require('../../core/security');
    var gameworld = mmoCore.gameworld;
    var io = mmoCore.socket.socketConnection;
    var database = mmoCore.database;
    io.on('connect', function (client) {
        // Handle players joining a map
        client.on('map_joined', function (playerData) {
            return __awaiter(this, void 0, void 0, function () {
                var switchKey, varKey, npcs;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (client.playerData === undefined) {
                                return [2 /*return*/];
                            }
                            if (client.lastMap !== undefined && client.lastMap !== 'map-' + playerData.mapId) {
                                if (database.SERVER_CONFIG.offlineMaps[client.lastMap] === undefined) {
                                    client.broadcast.to(client.lastMap).emit('map_exited', client.id);
                                }
                                client.leave(client.lastMap);
                                gameworld.playerLeaveInstance(client.playerData.id, parseInt(client.playerData.mapId));
                                security.createLog(client.playerData.username + ' left ' + client.lastMap);
                            }
                            playerData.username = client.playerData.username; // Temporary way to pass the username
                            playerData.skin = client.playerData.skin;
                            // Storing the new location (in case of disconnecting on a local map)
                            client.playerData.x = playerData.x;
                            client.playerData.y = playerData.y;
                            client.playerData.mapId = parseInt(playerData.mapId);
                            // Update global switches
                            for (switchKey in database.SERVER_CONFIG.globalSwitches) {
                                client.emit('player_update_switch', {
                                    switchId: switchKey,
                                    value: database.SERVER_CONFIG.globalSwitches[switchKey],
                                });
                            }
                            // Update global variables
                            for (varKey in database.SERVER_CONFIG.globalVariables) {
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
                            return [4 /*yield*/, gameworld.getConnectedNpcs(parseInt(client.playerData.mapId))];
                        case 1:
                            npcs = _a.sent();
                            if (npcs && npcs.length) {
                                client.emit('npcsFetched', {
                                    playerId: client.playerData.id,
                                    npcs: npcs,
                                });
                            }
                            security.createLog(client.playerData.username + ' joined ' + client.lastMap);
                            return [2 /*return*/];
                    }
                });
            });
        });
        // Refresh position of players when map joined
        client.on('refresh_players_position', function (data) {
            if (client.playerData === undefined) {
                return;
            }
            if (database.SERVER_CONFIG.offlineMaps[client.lastMap] !== undefined) {
                return false;
            }
            security.createLog(client.playerData.username + ' transmitted its position to ' + data.id);
            data.playerData.username = client.playerData.username; // Temporary way to pass the username
            data.playerData.skin = client.playerData.skin;
            data.playerData.isBusy = client.playerData.isBusy;
            console.log('MAP JOINED');
            console.log(client.id);
            console.log(data.playerData);
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
    });
};
