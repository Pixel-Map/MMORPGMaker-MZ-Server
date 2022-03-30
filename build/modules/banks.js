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
    var _this = this;
    var socket = mmoCore.socket, database = mmoCore.database;
    var io = socket.socketConnection;
    // ---------------------------------------
    // ---------- SOCKETS EVENTS
    // ---------------------------------------
    io.on('connect', function (player) {
        var _this = this;
        // When a player open a bank
        player.on('bank_open', function (bankName) { return __awaiter(_this, void 0, void 0, function () {
            var bank;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, exports.getBank(bankName)];
                    case 1:
                        bank = _a.sent();
                        // We make sure we send the correct info
                        bank.content =
                            bank.type === 'global'
                                ? bank.content
                                : bank.content[player.playerData.username] || {
                                    items: {},
                                    weapons: {},
                                    armors: {},
                                    gold: 0,
                                };
                        player.emit('bank_open', bank);
                        return [2 /*return*/];
                }
            });
        }); });
        // When a player deposit something in the bank
        player.on('bank_deposit', function (details) { return __awaiter(_this, void 0, void 0, function () {
            var bank, payload;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, exports.getBankById(details.bankId)];
                    case 1:
                        bank = _a.sent();
                        payload = bank.type === 'global'
                            ? bank.content
                            : bank.content[player.playerData.username] || {
                                items: {},
                                weapons: {},
                                armors: {},
                                gold: 0,
                            };
                        // If we are putting gold
                        if (details.gold) {
                            if (player.playerData.stats.gold < details.gold) {
                                return [2 /*return*/];
                            } // Anti-cheat : The player try to put more money than what he has
                            if (player.playerData.stats.gold <= 0) {
                                return [2 /*return*/];
                            } // Anti-cheat : The player try to put more money than what he has
                            player.playerData.stats.gold -= details.gold;
                            database.savePlayer({
                                username: player.playerData.username,
                                stats: player.playerData.stats,
                            }, function (e) {
                                socket.modules.player.subs.player.refreshData(player);
                                payload.gold += details.gold;
                                exports.saveBank(bank, payload, player);
                            });
                            // If we are putting an item
                        }
                        else {
                            if (!details.itemType) {
                                return [2 /*return*/];
                            }
                            if (!player.playerData.stats[details.itemType][details.itemId] ||
                                player.playerData.stats[details.itemType][details.itemId] < details.amount) {
                                return [2 /*return*/];
                            } // If the player is trying to duplicate or forge request
                            // Taking care of the player
                            if (player.playerData.stats[details.itemType][details.itemId] - details.amount <= 0) {
                                delete player.playerData.stats[details.itemType][details.itemId];
                            }
                            else {
                                player.playerData.stats[details.itemType][details.itemId] -= details.amount;
                            }
                            database.savePlayer({
                                username: player.playerData.username,
                                stats: player.playerData.stats,
                            }, function (e) {
                                socket.modules.player.subs.player.refreshData(player);
                                // Taking care of the bank
                                if (payload[details.itemType][details.itemId]) {
                                    payload[details.itemType][details.itemId] += details.amount;
                                }
                                else {
                                    payload[details.itemType][details.itemId] = details.amount;
                                }
                                exports.saveBank(bank, payload, player);
                            });
                        }
                        return [2 /*return*/];
                }
            });
        }); });
        // When a player withdraw from the bank
        player.on('bank_withdraw', function (details) { return __awaiter(_this, void 0, void 0, function () {
            var bank, payload;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, exports.getBankById(details.bankId)];
                    case 1:
                        bank = _a.sent();
                        payload = bank.type === 'global'
                            ? bank.content
                            : bank.content[player.playerData.username] || {
                                items: {},
                                weapons: {},
                                armors: {},
                                gold: 0,
                            };
                        // If we are withdrawing gold
                        if (details.gold) {
                            if (payload.gold < details.gold) {
                                return [2 /*return*/];
                            } // Anti-cheat : The player try to put more money than what he has
                            if (payload.gold <= 0) {
                                return [2 /*return*/];
                            } // Anti-cheat : The player try to put more money than what he has
                            player.playerData.stats.gold += details.gold;
                            database.savePlayer({
                                username: player.playerData.username,
                                stats: player.playerData.stats,
                            }, function (e) {
                                socket.modules.player.subs.player.refreshData(player);
                                payload.gold -= details.gold;
                                exports.saveBank(bank, payload, player);
                            });
                            // If we are withdrawing an item
                        }
                        else {
                            if (!details.itemType) {
                                return [2 /*return*/];
                            }
                            if (!payload[details.itemType][details.itemId] ||
                                payload[details.itemType][details.itemId] < details.amount) {
                                return [2 /*return*/];
                            } // If the player is trying to duplicate or forge request
                            // Taking care of the player
                            if (!player.playerData.stats[details.itemType][details.itemId]) {
                                player.playerData.stats[details.itemType][details.itemId] = details.amount;
                            }
                            else {
                                player.playerData.stats[details.itemType][details.itemId] += details.amount;
                            }
                            database.savePlayer({
                                username: player.playerData.username,
                                stats: player.playerData.stats,
                            }, function (e) {
                                socket.modules.player.subs.player.refreshData(player);
                                // Taking care of the bank
                                if (payload[details.itemType][details.itemId] - details.amount <= 0) {
                                    payload[details.itemType][details.itemId] = 0;
                                }
                                else {
                                    payload[details.itemType][details.itemId] -= details.amount;
                                }
                                exports.saveBank(bank, payload, player);
                            });
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    });
    // ---------------------------------------
    // ---------- EXPOSED FUNCTIONS
    // ---------------------------------------
    exports.getBank = function (bankName) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    database.getBank(bankName, function (bank) {
                        resolve(bank);
                    });
                })];
        });
    }); };
    exports.getBankById = function (bankId) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    database.getBankById(bankId, function (bank) {
                        resolve(bank);
                    });
                })];
        });
    }); };
    exports.saveBank = function (bank, payload, player) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (bank.type === 'global') {
                bank.content = payload;
            }
            else {
                bank.content[player.playerData.username] = payload;
            }
            database.saveBank(bank, function (e) {
                bank.content = payload;
                if (bank.type === 'global') {
                    socket.emitToAll('bank_refresh', bank);
                }
                else {
                    player.emit('bank_refresh', bank);
                }
            });
            return [2 /*return*/];
        });
    }); };
    // ---------------------------------------
    // ---------- PRIVATE FUNCTIONS
    // ---------------------------------------
};
