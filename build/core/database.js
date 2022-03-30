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
var core_1 = require("@mikro-orm/core");
var User_1 = require("../entities/User");
var Skin_1 = require("../entities/Skin");
var Stats_1 = require("../entities/Stats");
var security = require('./security');
var Database = /** @class */ (function () {
    function Database() {
        this.SERVER_CONFIG = {
            newPlayerDetails: {
                username: '',
                password: '',
                permission: 0,
                mapId: 1,
                x: 5,
                y: 5,
            },
            passwordRequired: true,
            globalSwitches: {},
            partySwitches: {},
            globalVariables: {},
            offlineMaps: {},
        };
    }
    Database.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, generator;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, core_1.MikroORM.init({
                                entities: ['./build/entities'],
                                entitiesTs: ['./src/entities'],
                                dbName: process.env.DATABASE_NAME,
                                host: process.env.DATABASE_HOST,
                                type: 'postgresql',
                                user: process.env.DATABASE_USERNAME,
                                password: process.env.DATABASE_PASSWORD,
                                loadStrategy: core_1.LoadStrategy.JOINED,
                                driverOptions: {
                                    connection: { ssl: { rejectUnauthorized: false } },
                                },
                            })];
                    case 1:
                        _a.orm = _b.sent();
                        generator = this.orm.getSchemaGenerator();
                        // await generator.dropSchema();
                        // await generator.createSchema();
                        return [4 /*yield*/, generator.updateSchema()];
                    case 2:
                        // await generator.dropSchema();
                        // await generator.createSchema();
                        _b.sent();
                        console.log('[I] All good! Everything is ready for you 😘');
                        console.log('[I] Database initialized with success');
                        return [2 /*return*/];
                }
            });
        });
    };
    Database.prototype.getPlayers = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var em, userRepository, users;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        em = this.orm.em.fork();
                        userRepository = em.getRepository(User_1.User);
                        return [4 /*yield*/, userRepository.findAll()];
                    case 1:
                        users = _a.sent();
                        return [2 /*return*/, users];
                }
            });
        });
    };
    Database.prototype.findUser = function (userDetails) {
        return __awaiter(this, void 0, void 0, function () {
            var em, userRepository, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        em = this.orm.em.fork();
                        userRepository = em.getRepository(User_1.User);
                        return [4 /*yield*/, userRepository.find({ username: userDetails.username }, {
                                limit: 1,
                                populate: ['skin', 'stats'],
                            })];
                    case 1:
                        user = _a.sent();
                        return [2 /*return*/, user[0]];
                }
            });
        });
    };
    Database.prototype.findUserById = function (userId, callback) {
        var em = this.orm.em.fork();
        var userRepository = em.getRepository(User_1.User);
        userRepository.find({ id: userId }, { limit: 1 }).then(function (output) {
            return callback(output);
        });
    };
    Database.prototype.deleteUserById = function (userId, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var em, userRepository, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        em = this.orm.em.fork();
                        userRepository = em.getRepository(User_1.User);
                        return [4 /*yield*/, userRepository.find({ id: userId }, { limit: 1 })];
                    case 1:
                        user = _a.sent();
                        userRepository.removeAndFlush(user).then(function (output) {
                            callback(output);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    Database.prototype.registerUser = function (userDetails) {
        return __awaiter(this, void 0, void 0, function () {
            var em, userRepository, skin, stats, user;
            return __generator(this, function (_a) {
                em = this.orm.em.fork();
                userRepository = em.getRepository(User_1.User);
                skin = new Skin_1.Skin();
                stats = new Stats_1.Stats();
                user = userRepository.create({
                    username: userDetails.username,
                    password: security.hashPassword(userDetails.password.toLowerCase()),
                    skin: skin,
                    stats: stats,
                });
                userRepository.persistAndFlush(user);
                return [2 /*return*/];
            });
        });
    };
    Database.prototype.savePlayer = function (playerData, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var em, userRepository, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('Saving playerdata: ' + playerData.username);
                        em = this.orm.em.fork();
                        userRepository = em.getRepository(User_1.User);
                        return [4 /*yield*/, userRepository.find({ username: playerData.username }, { limit: 1 })];
                    case 1:
                        user = _a.sent();
                        (0, core_1.wrap)(user[0]).assign(playerData, { em: em });
                        userRepository.persistAndFlush(user[0]);
                        return [2 /*return*/];
                }
            });
        });
    };
    Database.prototype.savePlayerById = function (playerData, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var em, userRepository, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        em = this.orm.em.fork();
                        userRepository = em.getRepository(User_1.User);
                        return [4 /*yield*/, userRepository.find({ id: playerData.id }, { limit: 1 })];
                    case 1:
                        user = _a.sent();
                        (0, core_1.wrap)(user[0]).assign(playerData, { em: em });
                        return [2 /*return*/];
                }
            });
        });
    };
    /// ////////////// BANKS
    Database.prototype.getBanks = function (callback) {
        // r.db('mmorpg')
        //     .table('banks')
        //     .run(conn)
        //     .then(function (cursor) {
        //         return cursor.toArray();
        //     })
        //     .then(function (output) {
        //         callback(output);
        //     })
        //     .finally(function () {
        //         conn.close();
        //     });
    };
    Database.prototype.getBank = function (bankName, callback) {
        // r.db('mmorpg')
        //     .table('banks')
        //     .filter({ name: bankName })
        //     .run(conn)
        //     .then(function (cursor) {
        //         return cursor.toArray();
        //     })
        //     .then(function (output) {
        //         callback(output[0]);
        //     })
        //     .finally(function () {
        //         conn.close();
        //     });
    };
    Database.prototype.getBankById = function (bankId, callback) {
        // r.db('mmorpg')
        //     .table('banks')
        //     .get(bankId)
        //     .run(conn)
        //     .then(function (cursor) {
        //         return cursor;
        //     })
        //     .then(function (output) {
        //         callback(output);
        //     })
        //     .finally(function () {
        //         conn.close();
        //     });
    };
    Database.prototype.saveBank = function (bank, callback) {
        // r.db('mmorpg')
        //     .table('banks')
        //     .get(bank.id)
        //     .update(bank)
        //     .run(conn)
        //     .then(function (output) {
        //         callback(output);
        //     })
        //     .finally(function () {
        //         conn.close();
        //     });
    };
    Database.prototype.createBank = function (payload, callback) {
        // const content = payload.type === 'global' ? { items: {}, weapons: {}, armors: {}, gold: 0 } : {};
        // const template = {
        //     name: payload.name,
        //     type: payload.type,
        //     content: content,
        // };
        //
        // r.db('mmorpg')
        //     .table('banks')
        //     .insert(template)
        //     .run(conn)
        //     .then(function (output) {
        //         callback(output);
        //     })
        //     .finally(function () {
        //         conn.close();
        //     });
    };
    Database.prototype.deleteBank = function (bankId, callback) {
        // r.db('mmorpg')
        //     .table('banks')
        //     .get(bankId)
        //     .delete()
        //     .run(conn)
        //     .then(function (output) {
        //         callback(output);
        //     })
        //     .finally(function () {
        //         conn.close();
        //     });
    };
    /// ////////////// SERVER
    Database.prototype.changeConfig = function (type, payload, callback) {
        // let query = r.db('mmorpg').table('config')(0);
        //
        // if (type === 'globalSwitches') {
        //     query = query.update({ globalSwitches: r.literal(payload) });
        // } else if (type === 'partySwitches') {
        //     query = query.update({ partySwitches: r.literal(payload) });
        // } else if (type === 'offlineMaps') {
        //     query = query.update({ offlineMaps: r.literal(payload) });
        // } else if (type === 'globalVariables') {
        //     query = query.update({ globalVariables: r.literal(payload) });
        // } else if (type === 'newPlayerDetails') {
        //     query = query.update({ newPlayerDetails: r.literal(payload) });
        // }
        //
        // query
        //     .run(conn)
        //     .then(function (cursor) {
        //         return cursor;
        //     })
        //     .then(() => {
        //         this.reloadConfig(() => {
        //             console.log('[I] Server configuration changes saved.');
        //         });
        //         callback();
        //     })
        //     .finally(() => {
        //         conn.close();
        //     });
    };
    Database.prototype.saveConfig = function () {
        // r.db('mmorpg')
        //     .table('config')(0)
        //     .update(this.SERVER_CONFIG)
        //     .run(conn)
        //     .then(() => {
        //         console.log('[I] Server configuration changes saved.');
        //     })
        //     .finally(() => {
        //         conn.close();
        //     });
    };
    return Database;
}());
exports.default = Database;
