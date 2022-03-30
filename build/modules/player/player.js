"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var core_1 = require("@mikro-orm/core");
exports.initialize = function (mmoCore) {
    var socket = mmoCore.socket, database = mmoCore.database;
    var gameworld = mmoCore.gameworld;
    var io = socket.socketConnection;
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
        client.on('player_update_stats', function (payload) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (client.playerData === undefined) {
                        return [2 /*return*/];
                    }
                    (0, core_1.wrap)(client.playerData.stats).assign(__assign({}, payload), { mergeObjects: true });
                    database.savePlayer(client.playerData, function () {
                        exports.refreshData(client);
                    });
                    return [2 /*return*/];
                });
            });
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
        client.on('player_update_busy', function (payload) {
            console.log('Update player busy');
            if (client.playerData === undefined) {
                return;
            }
            if (client.playerData.isBusy === payload) {
                return;
            }
            client.playerData.isBusy = payload;
            console.log(payload);
            database.savePlayer({
                username: client.playerData.username,
                isBusy: client.playerData.isBusy,
            }, function (e) {
                client.broadcast.to('map-' + client.playerData.mapId).emit('refresh_players_on_map', {
                    playerId: client.id,
                    playerData: client.playerData,
                });
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
    exports.getPlayers = function (spaceName) {
        return __awaiter(this, void 0, void 0, function () {
            var sockets, players, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        spaceName = spaceName || false;
                        return [4 /*yield*/, socket.getConnectedSockets(spaceName)];
                    case 1:
                        sockets = _a.sent();
                        players = {};
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        for (i = 0; i < sockets.length; i++) {
                            if (!sockets[i].playerData) {
                                continue;
                            }
                            players[sockets[i].playerData.username.toLowerCase()] = sockets[i];
                        }
                        return [2 /*return*/, players];
                }
            });
        });
    };
    exports.getPlayer = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            var players;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, exports.getPlayers()];
                    case 1:
                        players = _a.sent();
                        return [2 /*return*/, players[username.toLowerCase()] || null];
                }
            });
        });
    };
    exports.getPlayerById = function (socketId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, io.sockets.connected[socketId]];
            });
        });
    };
    exports.refreshData = function (player) {
        database.findUserById(player.playerData.id, function (playerData) {
            delete playerData.password; // We delete the password from the result sent back
            player.emit('refresh_player_data', playerData, function () {
                if (!player.isInParty) {
                    return;
                }
                socket.modules.player.subs.party.refreshPartyData(player.isInParty);
            });
        });
    };
};
