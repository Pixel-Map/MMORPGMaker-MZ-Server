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
    var gameworld = mmoCore.gameworld;
    exports.use = function (args, initiator) {
        return __awaiter(this, void 0, void 0, function () {
            var mode, _print, _error, summonId, coords, pageIndex, summonedId, removedUniqueId, idList, index, _npc, mapId, x, y;
            return __generator(this, function (_a) {
                if (initiator.playerData.permission < 100) {
                    return [2 /*return*/, socket.modules.messages.sendToPlayer(initiator, 'System', "You don't have the permission to use this command.", 'error')];
                }
                if (args.length < 1) {
                    return [2 /*return*/, socket.modules.messages.sendToPlayer(initiator, 'System', 'Not enough arguments.', 'error')];
                }
                if (!gameworld.getSummonMap()) {
                    return [2 /*return*/, socket.modules.messages.sendToPlayer(initiator, 'System', 'The server has no spawnMap.', 'error')];
                }
                mode = args[1];
                _print = function (string) { return socket.modules.messages.sendToPlayer(initiator, 'System', string, 'action'); };
                _error = function (string) { return socket.modules.messages.sendToPlayer(initiator, 'System', string, 'error'); };
                if (mode === 'add' || mode === 'spawn' || mode === 'summon' || mode === 'a' || mode === 's') {
                    summonId = parseInt(args[2]);
                    coords = {
                        mapId: parseInt(args[3]) || initiator.playerData.mapId,
                        x: parseInt(args[4]) || initiator.playerData.x,
                        y: parseInt(args[5]) || initiator.playerData.y,
                    };
                    pageIndex = args[6] ? parseInt(args[6]) : 0;
                    summonedId = gameworld.spawnNpc(summonId, coords, pageIndex, initiator.playerData.id).toString();
                    if (summonedId)
                        _print("Spawned NPC [index: ".concat(summonedId, "]"));
                    else
                        _error("NPC not found [index ".concat(args[2], "]"));
                }
                else if (mode === 'remove' || mode === 'delete' || mode === 'rm' || mode === 'del') {
                    removedUniqueId = gameworld.removeSpawnedNpcByIndex(args[2]);
                    if (removedUniqueId)
                        _print("You removed ".concat(removedUniqueId, " [index: ").concat(args[2], "]"));
                    else
                        _error("NPC not found [index ".concat(args[2], "]"));
                }
                else {
                    idList = gameworld.spawnedUniqueIds;
                    if (idList && idList.length) {
                        _print('/npc = (index, coordinates, uniqueId) =>');
                        console.log('/npc => [');
                        for (index in idList) {
                            _npc = gameworld.getNpcByUniqueId(idList[index]);
                            if (_npc) {
                                mapId = _npc.mapId;
                                x = _npc.x;
                                y = _npc.y;
                                _print("[".concat(index, "] (").concat(mapId, ",").concat(x, ",").concat(y, ") ").concat(idList[index]));
                                console.log(_npc);
                            }
                        }
                        console.log(']');
                    }
                    else
                        _error('/npc = (index, coordinates, uniqueId) => NONE');
                }
                return [2 /*return*/];
            });
        });
    };
};
