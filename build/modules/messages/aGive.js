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
    var socket = mmoCore.socket;
    var database = mmoCore.database;
    //  agive playerName[1] itemType[2] itemId/amount[3] amount[4]
    exports.use = function (args, initiator) {
        return __awaiter(this, void 0, void 0, function () {
            var players, amount, itemId, targetsName;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (initiator.playerData.permission < 100) {
                            return [2 /*return*/, socket.modules.messages.sendToPlayer(initiator, 'System', "You don't have the permission to use this command.", 'error')];
                        }
                        return [4 /*yield*/, socket.modules.player.subs.player.getPlayers()];
                    case 1:
                        players = _a.sent();
                        amount = parseInt(args[4] !== undefined ? args[4] : args[3]);
                        itemId = parseInt(args[3]);
                        targetsName = args[1].toLowerCase();
                        if (players[targetsName] === undefined) {
                            return [2 /*return*/, socket.modules.messages.sendToPlayer(initiator, 'System', 'Could not find the player.', 'error')];
                        }
                        if (isNaN(args[3])) {
                            return [2 /*return*/, socket.modules.messages.sendToPlayer(initiator, 'System', 'Value is not valid.', 'error')];
                        }
                        if (args.length < 4) {
                            return [2 /*return*/, socket.modules.messages.sendToPlayer(initiator, 'System', 'Not enough arguments.', 'error')];
                        }
                        if (args[2] === 'gold') {
                            players[targetsName].playerData.stats.gold += amount;
                            socket.modules.messages.sendToPlayer(players[targetsName], 'System', "".concat(initiator.playerData.username, " gave you ").concat(args[3], " gold!"), 'action');
                            socket.modules.messages.sendToPlayer(initiator, 'System', "You gave ".concat(args[3], " gold to ").concat(players[targetsName].playerData.username, "!"), 'action');
                        }
                        else if (args[2] === 'skills') {
                            if (itemId > 0) {
                                if (players[targetsName].playerData.stats[args[2]].includes(itemId)) {
                                    return [2 /*return*/, socket.modules.messages.sendToPlayer(initiator, 'System', "".concat(players[targetsName].playerData.username, " already has this skill."), 'action')];
                                }
                                else {
                                    players[targetsName].playerData.stats.skills.push(itemId);
                                }
                                socket.modules.messages.sendToPlayer(players[targetsName], 'System', "".concat(initiator.playerData.username, " gave you ").concat(itemId, " Skill!"), 'action');
                                socket.modules.messages.sendToPlayer(initiator, 'System', "You gave skill ".concat(itemId, " to ").concat(players[targetsName].playerData.username, "!"), 'action');
                            }
                            else {
                                players[targetsName].playerData.stats.skills = players[targetsName].playerData.stats.skills.filter(function (skill) {
                                    if (skill !== -itemId) {
                                        return skill;
                                    }
                                });
                                socket.modules.messages.sendToPlayer(players[targetsName], 'System', "".concat(initiator.playerData.username, " removed ").concat(itemId, " skill from you!"), 'action');
                                socket.modules.messages.sendToPlayer(initiator, 'System', "You removed skill ".concat(itemId, " from ").concat(players[targetsName].playerData.username, "!"), 'action');
                            }
                        }
                        else if (args[2] === 'levels') {
                            players[targetsName].playerData.stats.level += amount;
                            socket.modules.messages.sendToPlayer(players[targetsName], 'System', "".concat(initiator.playerData.username, " gave you ").concat(amount, " levels!"), 'action');
                            socket.modules.messages.sendToPlayer(initiator, 'System', "You gave ".concat(amount, " levels to ").concat(players[targetsName].playerData.username, "!"), 'action');
                        }
                        else if (args[2] === 'permission') {
                            if (initiator.playerData.permission < amount) {
                                return [2 /*return*/, socket.modules.messages.sendToPlayer(initiator, 'System', "You don't have the permission to give that amount of permission!", 'error')];
                            }
                            players[targetsName].playerData.permission = amount;
                            socket.modules.messages.sendToPlayer(players[targetsName], 'System', "".concat(initiator.playerData.username, " gave you ").concat(amount, " permission!"), 'action');
                            socket.modules.messages.sendToPlayer(initiator, 'System', "You gave ".concat(amount, " permission level to ").concat(players[targetsName].playerData.username, "!"), 'action');
                        }
                        else if (args[2] === 'exp') {
                            players[targetsName].playerData.stats.exp[1] += amount;
                            socket.modules.messages.sendToPlayer(players[targetsName], 'System', "".concat(initiator.playerData.username, " gave you ").concat(amount, " exp!"), 'action');
                            socket.modules.messages.sendToPlayer(initiator, 'System', "You gave ".concat(amount, " exp to ").concat(players[targetsName].playerData.username, "!"), 'action');
                        }
                        else {
                            if (args[2] !== 'weapons' && args[2] !== 'items' && args[2] !== 'armors') {
                                return [2 /*return*/, socket.modules.messages.sendToPlayer(initiator, 'System', 'Item type is not valid.', 'error')];
                            }
                            if (isNaN(args[4])) {
                                return [2 /*return*/, socket.modules.messages.sendToPlayer(initiator, 'System', 'Value is not valid.', 'error')];
                            }
                            if (players[targetsName].playerData.stats[args[2]][itemId]) {
                                players[targetsName].playerData.stats[args[2]][itemId] += amount;
                            }
                            else {
                                players[targetsName].playerData.stats[args[2]][itemId] = amount;
                            }
                            socket.modules.messages.sendToPlayer(initiator, 'System', 'username: ' + targetsName + ', ' + args[2] + 'ID: ' + args[3] + ', with amount: ' + args[4], 'action');
                            socket.modules.messages.sendToPlayer(players[targetsName], 'System', "".concat(initiator.playerData.username, " gave you ").concat(args[3], " in the amount of ").concat(args[4], "!"), 'action');
                        }
                        database.savePlayer({
                            username: players[targetsName].playerData.username,
                            stats: players[targetsName].playerData.stats,
                            permission: players[targetsName].playerData.permission,
                        }, function (e) {
                            socket.modules.player.subs.player.refreshData(players[targetsName]);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
};
