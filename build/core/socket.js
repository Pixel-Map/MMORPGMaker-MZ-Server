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
var fs = require('fs');
var fsPromises = fs.promises;
var EventEmitter = require('events');
var Socket = /** @class */ (function () {
    function Socket() {
        this.serverEvent = new EventEmitter();
        this.modules = {};
    }
    Socket.prototype.initialize = function (socketConnection, mmoCore) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.socketConnection = socketConnection;
                        // We load all the modules in the socket server
                        return [4 /*yield*/, this.loadModules('', false, mmoCore)];
                    case 1:
                        // We load all the modules in the socket server
                        _a.sent();
                        console.log("[I] Socket.IO server started on port ".concat(process.env.PORT ? process.env.PORT : 8097, "..."));
                        return [2 /*return*/];
                }
            });
        });
    };
    Socket.prototype.loadModules = function (path, isSub, mmoCore) {
        return __awaiter(this, void 0, void 0, function () {
            var modulePath, correctedPath, files, err_1, _i, files_1, file, stats, moduleName, key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (isSub && this.modules[path].subs === undefined) {
                            this.modules[path].subs = {};
                        }
                        modulePath = isSub ? this.modules[path].subs : this.modules;
                        correctedPath = "".concat(__dirname, "/../modules/").concat(path);
                        files = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fsPromises.readdir(correctedPath)];
                    case 2:
                        files = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        return [2 /*return*/, err_1];
                    case 4:
                        files = files.filter(function (fileName) {
                            if (fileName.includes('.js')) {
                                return fileName;
                            }
                        });
                        for (_i = 0, files_1 = files; _i < files_1.length; _i++) {
                            file = files_1[_i];
                            stats = fs.statSync("".concat(correctedPath, "/").concat(file));
                            moduleName = file.split('.')[0];
                            if (!stats.isDirectory()) {
                                modulePath[moduleName] = require("".concat(correctedPath, "/").concat(file));
                                if (Object.keys(files).length === Object.keys(modulePath).length) {
                                    console.log("[I] Loaded ".concat(Object.keys(modulePath).length, " modules."));
                                    for (key in modulePath) {
                                        if (typeof modulePath[key] === 'function') {
                                            continue;
                                        }
                                        modulePath[key].initialize(mmoCore);
                                        console.log("[I] Module ".concat(key, " initialized."));
                                    }
                                }
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    // Return all connected sockets to the world or specific room (map-* OR party-*)
    Socket.prototype.getConnectedSockets = function (roomName) {
        var _this = this;
        return new Promise(function (resolve) {
            var sockets = [];
            var ns = _this.socketConnection.of('/');
            for (var id in ns.connected) {
                if (roomName) {
                    var index = ns.connected[id].rooms.indexOf(roomName);
                    if (index !== -1) {
                        sockets.push(ns.connected[id]);
                    }
                }
                else {
                    sockets.push(ns.connected[id]);
                }
            }
            return resolve(sockets);
        });
    };
    // Send a socket to the entire server
    Socket.prototype.emitToAll = function (name, payload) {
        this.socketConnection.emit(name, payload);
    };
    return Socket;
}());
exports.default = Socket;
