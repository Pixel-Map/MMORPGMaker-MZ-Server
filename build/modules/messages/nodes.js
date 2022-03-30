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
            var _print, nodes, _i, nodes_1, node, mapId, x, y, coords;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (initiator.playerData.permission < 100) {
                            return [2 /*return*/, socket.modules.messages.sendToPlayer(initiator, 'System', "You don't have the permission to use this command.", 'error')];
                        }
                        if (args.length < 1) {
                            return [2 /*return*/, socket.modules.messages.sendToPlayer(initiator, 'System', 'Not enough arguments.', 'error')];
                        }
                        if (!gameworld.getSummonMap()) {
                            return [2 /*return*/, socket.modules.messages.sendToPlayer(initiator, 'System', 'The server has no spawnMap.', 'error')];
                        }
                        _print = function (string) { return socket.modules.messages.sendToPlayer(initiator, 'System', string, 'action'); };
                        return [4 /*yield*/, gameworld.nodes];
                    case 1:
                        nodes = _a.sent();
                        if (nodes && nodes.length) {
                            _print('/nodes = (coordinates, id) =>');
                            console.log('/nodes => [');
                            for (_i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                                node = nodes_1[_i];
                                mapId = node.mapId >= 0 ? node.mapId.toString() : '';
                                x = node.x >= 0 ? node.x.toString() : '';
                                y = node.y >= 0 ? node.y.toString() : '';
                                coords = (mapId && x && y && " [".concat(mapId, ",").concat(x, ",").concat(y, "]")) || '[WORLD]';
                                _print("".concat(coords, " ").concat(node.playerId || node.npcUniqueId || node.instanceUniqueId || node.uniqueId));
                                console.log(node);
                            }
                            console.log(']');
                        }
                        else
                            Error('/nodes = (coordinates, id) => NONE');
                        return [2 /*return*/];
                }
            });
        });
    };
};