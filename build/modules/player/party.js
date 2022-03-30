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
exports.combat = {};
exports.initialize = function (mmoCore) {
    var _this = this;
    var gamedata = require('../../core/gamedata');
    var socket = mmoCore.socket;
    var io = socket.socketConnection;
    // ---------------------------------------
    // ---------- SOCKETS EVENTS
    // ---------------------------------------
    io.on('connect', function (player) {
        var _this = this;
        player.on('party_player_join_fight', function (gameTroop) {
            return __awaiter(this, void 0, void 0, function () {
                var partyMembers, k;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!player.isInParty) {
                                return [2 /*return*/];
                            }
                            // If the party is already in combat
                            if (exports.combat[player.isInParty][player.playerData.mapId]) {
                                // If the member already exist we do nothinng
                                if (exports.combat[player.isInParty][player.playerData.mapId].members[player.id]) {
                                    // eslint-disable-next-line no-return-assign
                                    return [2 /*return*/, (exports.combat[player.isInParty][player.playerData.mapId].state = gameTroop)];
                                }
                                // We add/update the member of the combat
                                exports.combat[player.isInParty][player.playerData.mapId].members[player.id] = player;
                                exports.refreshPartyData(player.isInParty);
                                player.emit('party_player_join_fight', exports.combat[player.isInParty][player.playerData.mapId].state);
                                return [2 /*return*/];
                            }
                            // If the party is starting the combat.
                            exports.combat[player.isInParty][player.playerData.mapId] = {
                                initiator: player,
                                state: gameTroop,
                                members: {},
                                actions: {},
                            };
                            exports.combat[player.isInParty][player.playerData.mapId].members[player.id] = player;
                            return [4 /*yield*/, socket.modules.player.subs.player.getPlayers(player.isInParty)];
                        case 1:
                            partyMembers = (_a.sent()) || {};
                            // We iterate through to them to invoke them in the battle if on the same map
                            for (k in partyMembers) {
                                if (partyMembers[k].id === player.id) {
                                    continue;
                                } // If member is the same than player, we do nothing.
                                if (partyMembers[k].playerData.mapId !== player.playerData.mapId) {
                                    continue;
                                } // If member is not on the same map, we don't nothing.
                                // We send the join fight socket
                                partyMembers[k].emit('party_player_join_fight', exports.combat[player.isInParty][player.playerData.mapId].state);
                            }
                            exports.refreshPartyData(player.isInParty);
                            return [2 /*return*/];
                    }
                });
            });
        });
        /*:
         * party_player_action_fight
         */
        player.on('party_player_action_fight', function (action) { return __awaiter(_this, void 0, void 0, function () {
            var actionsLength, membersLength, actions;
            return __generator(this, function (_a) {
                console.log('party_player_action_fight');
                if (!player.isInParty ||
                    !exports.combat[player.isInParty] ||
                    !exports.combat[player.isInParty][player.playerData.mapId]) {
                    return [2 /*return*/];
                }
                // We add the identifiable action to the variable
                action.id = player.id;
                exports.combat[player.isInParty][player.playerData.mapId].actions[player.playerData.username] = action;
                actionsLength = Object.keys(exports.combat[player.isInParty][player.playerData.mapId].actions).length;
                membersLength = Object.keys(exports.combat[player.isInParty][player.playerData.mapId].members).length;
                // If all players have finished doing actions
                if (actionsLength === membersLength) {
                    actions = exports.combat[player.isInParty][player.playerData.mapId].actions;
                    exports.combat[player.isInParty][player.playerData.mapId].initiator.emit('party_player_estimate_fight', actions);
                    // We empty the variable actions for the next turn
                    exports.combat[player.isInParty][player.playerData.mapId].actions = {};
                }
                return [2 /*return*/];
            });
        }); });
        player.on('party_player_estimate_fight', function (results) {
            console.log('party_player_estimate_fight');
            for (var k in exports.combat[player.isInParty][player.playerData.mapId].members) {
                exports.combat[player.isInParty][player.playerData.mapId].members[k].emit('party_player_action_fight', results);
            }
        });
        player.on('party_player_end_fight', function () {
            console.log('party_player_end_fight');
            if (!player.isInParty) {
            }
            if (!exports.combat[player.isInParty]) {
                return;
            }
            if (!exports.combat[player.isInParty][player.playerData.mapId]) {
                return;
            }
            player.playerData.isInCombat = false;
            if (exports.combat[player.isInParty][player.playerData.mapId].initiator.id === player.id) {
                exports.disbandFight(player.isInParty, player.playerData.mapId);
            }
        });
        player.on('player_update_stats', function () {
            exports.refreshPartyData(player.isInParty);
        });
        // Automatically leave the party when disconnecting
        player.on('disconnect', function () {
            if (exports.combat[player.isInParty]) {
                var mapId = player.playerData.mapId;
                if (exports.combat[player.isInParty][mapId]) {
                    if (exports.combat[player.isInParty][mapId].members[player.id]) {
                        delete exports.combat[player.isInParty][mapId].members[player.id];
                    }
                    if (exports.combat[player.isInParty][mapId].initiator.id === player.id) {
                        exports.disbandFight(player.isInParty, mapId);
                    }
                }
            }
            exports.leaveParty(player);
        });
    });
    // ---------------------------------------
    // ---------- EXPOSED FUNCTIONS
    // ---------------------------------------
    exports.getPartyLeader = function (partyName) { return __awaiter(_this, void 0, void 0, function () {
        var hostId;
        return __generator(this, function (_a) {
            hostId = partyName.split('party-')[1];
            return [2 /*return*/, io.sockets.connected[hostId]];
        });
    }); };
    exports.joinParty = function (joiner, joinee) { return __awaiter(_this, void 0, void 0, function () {
        var maxMembers, partyName, rawPartyMembers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // If the joiner is alreayd in a party, we do nothing
                    if (joiner.isInParty) {
                        return [2 /*return*/];
                    }
                    maxMembers = gamedata.data.Actors.length - 1;
                    partyName = "party-".concat(joinee.id);
                    return [4 /*yield*/, socket.modules.player.subs.player.getPlayers(partyName)];
                case 1:
                    rawPartyMembers = (_a.sent()) || {};
                    // If the party is attempted to be created but the game settings don't allow it
                    if (maxMembers === 1 || maxMembers < Object.keys(rawPartyMembers).length + 1) {
                        return [2 /*return*/];
                    }
                    joiner.isInParty = partyName; // We put the joiner in the party
                    joiner.join(partyName, function () {
                        // We create the party if it was not an existant one before.
                        if (!joinee.isInParty) {
                            joinee.join(partyName, function () {
                                // We initialize the party if just created.
                                joinee.isInParty = partyName;
                                exports.combat[partyName] = {};
                                exports.refreshPartyData(partyName);
                            });
                        }
                        else {
                            exports.refreshPartyData(partyName);
                        }
                        socket.serverEvent.emit('player-joined-party', {
                            player: joiner,
                            partyName: partyName,
                        });
                    });
                    return [2 /*return*/];
            }
        });
    }); };
    exports.leaveParty = function (leaver) { return __awaiter(_this, void 0, void 0, function () {
        var partyName, partyLeader;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!leaver.isInParty) {
                        return [2 /*return*/];
                    }
                    partyName = leaver.isInParty;
                    return [4 /*yield*/, exports.getPartyLeader(leaver.isInParty)];
                case 1:
                    partyLeader = _a.sent();
                    leaver.leave(partyName, function () {
                        leaver.isInParty = false;
                        leaver.isInCombat = false;
                        leaver.emit('refresh_party_data', {});
                        exports.refreshPartyData(partyName);
                        socket.serverEvent.emit('player-left-party', {
                            player: leaver,
                            partyName: partyName,
                        });
                        // If party lead is leaving
                        if (partyLeader === undefined || leaver.id === partyLeader.id) {
                            return exports.disbandParty(partyName);
                        }
                    });
                    return [2 /*return*/];
            }
        });
    }); };
    exports.disbandParty = function (partyName) { return __awaiter(_this, void 0, void 0, function () {
        var partyMembers, partyLeader, k;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, socket.getConnectedSockets(partyName)];
                case 1:
                    partyMembers = _a.sent();
                    return [4 /*yield*/, socket.modules.player.subs.player.getPlayerById(partyName.split('party-')[1])];
                case 2:
                    partyLeader = _a.sent();
                    socket.serverEvent.emit('player-disbanded-party', {
                        partyLeader: partyLeader,
                        partyName: partyName,
                    });
                    delete exports.combat[partyName]; // We delete all fights related to the party
                    // @ts-ignore
                    for (k in partyMembers) {
                        partyMembers[k].isInParty = false;
                        partyMembers[k].playerData.isInCombat = false;
                        partyMembers[k].emit('refresh_party_data', {});
                        exports.leaveParty(partyName);
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    exports.refreshPartyData = function (partyName) { return __awaiter(_this, void 0, void 0, function () {
        var rawPartyMembers, partyMembers, k;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!partyName || io.sockets.adapter.rooms[partyName] === undefined) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, socket.modules.player.subs.player.getPlayers(partyName)];
                case 1:
                    rawPartyMembers = (_a.sent()) || {};
                    partyMembers = {};
                    for (k in rawPartyMembers) {
                        partyMembers[k] = rawPartyMembers[k].playerData;
                        partyMembers[k].isInitiator = !!(exports.combat[partyName][rawPartyMembers[k].playerData.mapId] &&
                            exports.combat[partyName][rawPartyMembers[k].playerData.mapId].initiator.id === rawPartyMembers[k].id);
                        partyMembers[k].isInCombat = !!(exports.combat[partyName][rawPartyMembers[k].playerData.mapId] &&
                            exports.combat[partyName][rawPartyMembers[k].playerData.mapId].members[rawPartyMembers[k].id]);
                    }
                    io.in(partyName).emit('refresh_party_data', partyMembers);
                    return [2 /*return*/];
            }
        });
    }); };
    // ===============
    // Combat handling
    // ===============
    // Return if the party of the player is in combat
    exports.isInCombat = function (player) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!player.isInParty || !exports.combat[player.isInParty][player.playerData.mapId]) {
                return [2 /*return*/, false];
            }
            if (exports.combat[player.isInParty][player.playerData.mapId].initiator.id === player.id) {
                return [2 /*return*/, false];
            }
            return [2 /*return*/, exports.combat[player.isInParty][player.playerData.mapId]];
        });
    }); };
    exports.joinFight = function (player) {
        if (exports.combat[player.isInParty][player.playerData.mapId].members[player.id]) {
            return;
        }
        // We add the player to the fight
        exports.combat[player.isInParty][player.playerData.mapId].members[player.id] = player;
        player.emit('party_player_join_fight', exports.combat[player.isInParty][player.playerData.mapId].state);
    };
    exports.disbandFight = function (partyName, mapId) { return __awaiter(_this, void 0, void 0, function () {
        var party, rawPartyMembers, k;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!exports.combat[partyName][mapId]) {
                        return [2 /*return*/];
                    }
                    party = exports.combat[partyName][mapId];
                    delete exports.combat[partyName][mapId];
                    return [4 /*yield*/, socket.modules.player.subs.player.getPlayers(partyName)];
                case 1:
                    rawPartyMembers = (_a.sent()) || {};
                    for (k in rawPartyMembers) {
                        if (rawPartyMembers[k].playerData.mapId !== party.initiator.playerData.mapId) {
                            continue;
                        }
                        rawPartyMembers[k].emit('party_player_disband_fight');
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    // ---------------------------------------
    // ---------- PRIVATE FUNCTIONS
    // ---------------------------------------
};
