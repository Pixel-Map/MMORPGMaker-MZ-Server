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
        var _this = this;
        // Handle in-game user login and registration
        // Expect : data : {username, password (optional)}
        client.on('login', function (data) { return __awaiter(_this, void 0, void 0, function () {
            var user, existingPlayer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (data.username === undefined) {
                            return [2 /*return*/, loginError(client, 'Missing username')];
                        }
                        if (database.SERVER_CONFIG.passwordRequired && data.password === undefined) {
                            return [2 /*return*/, loginError(client, 'Missing password')];
                        }
                        return [4 /*yield*/, database.findUser(data)];
                    case 1:
                        user = _a.sent();
                        if (!(user == undefined)) return [3 /*break*/, 2];
                        return [2 /*return*/, loginError(client, 'Account does not exist')];
                    case 2:
                        console.log(user.password + ' vs. ' + security.hashPassword(data.password.toLowerCase()));
                        if (!(security.hashPassword(data.password.toLowerCase()) == user.password.toLowerCase())) return [3 /*break*/, 4];
                        return [4 /*yield*/, mmoCore.socket.modules.player.subs.player.getPlayer(data.username)];
                    case 3:
                        existingPlayer = _a.sent();
                        if (existingPlayer !== null) {
                            return [2 /*return*/, loginError(client, 'Player is already connected.')];
                        }
                        return [2 /*return*/, loginSuccess(client, user, mmoCore)];
                    case 4: return [2 /*return*/, loginError(client, 'Bad password!')];
                }
            });
        }); });
        client.on('register', function (data) { return __awaiter(_this, void 0, void 0, function () {
            // username validation
            function isValidUsername(string) {
                return /^(?=[a-zA-Z0-9\s]{4,25}$)(?=[a-zA-Z0-9\s])(?:([\w\s*?])\1?(?!\1))+$/.test(string);
            }
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (data.username === undefined) {
                            return [2 /*return*/, loginError(client, 'Missing username')];
                        }
                        if (data.username.includes(' ')) {
                            return [2 /*return*/, loginError(client, "Pseudo can't contain spaces")];
                        }
                        if (!isValidUsername(data.username)) {
                            return [2 /*return*/, loginError(client, 'Incorrect username format')];
                        }
                        // password validation
                        if (database.SERVER_CONFIG.passwordRequired && data.password === undefined) {
                            return [2 /*return*/, loginError(client, 'Missing password')];
                        }
                        return [4 /*yield*/, database.findUser(data)];
                    case 1:
                        user = _a.sent();
                        if (!(user !== undefined)) return [3 /*break*/, 2];
                        return [2 /*return*/, loginError(client, 'Cannot create this account.')]; // Avoid telling that username is taken !
                    case 2: 
                    // If user doesn't exist
                    return [4 /*yield*/, database.registerUser(data)];
                    case 3:
                        // If user doesn't exist
                        _a.sent();
                        return [2 /*return*/, registerSuccess(client)];
                }
            });
        }); });
        // Handle the disconnection of a player
        client.on('disconnect', function () {
            if (client.lastMap === undefined) {
                return;
            }
            gameworld.removeNode(gameworld.getNodeBy('playerId', client.playerData.id));
            gameworld.playerLeaveInstance(client.playerData.id, parseInt(client.playerData.mapId));
            // ANTI-CHEAT : Deleting some entries before saving the character.
            delete client.playerData.permission; // Avoid permission elevation exploit
            delete client.playerData.id; // Avoid account-spoofing
            delete client.playerData.isInCombat; // Sanitizing
            // client.playerData.isInCombat = false;
            security.createLog("".concat(client.playerData.username, " disconnected from the game."));
            database.savePlayer(client.playerData, function (_) {
                client.broadcast.to(client.lastMap).emit('map_exited', client.id);
                client.leave(client.lastMap);
            });
        });
    });
};
// ---------------------------------------
// ---------- EXPOSED FUNCTIONS
// ---------------------------------------
exports.saveWorld = function () {
    // To do : Save every players before closing the server
};
// ---------------------------------------
// ---------- PRIVATE FUNCTIONS
// ---------------------------------------
// Connecting the player and storing datas locally
function loginSuccess(client, details, mmoCore) {
    console.log(details);
    var security = require('../../core/security');
    // We remove the things we don't want the user to see
    delete details.password;
    details.isBusy = false;
    // Then we continue
    client.emit('login_success', { msg: details });
    client.playerData = details;
    mmoCore.gameworld.attachNode(client.playerData, true);
    security.createLog(client.playerData.username + ' connected to the game');
}
// Sending error in case of failure at login
function loginError(client, message) {
    client.emit('login_error', { msg: message });
}
// Register user emitter
function registerSuccess(client) {
    client.emit('register_success', { msg: 'Account has been created !' });
}
