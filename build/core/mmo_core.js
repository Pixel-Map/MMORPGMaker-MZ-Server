"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var socket_1 = __importDefault(require("./socket"));
var database_1 = __importDefault(require("./database"));
var gamedata_1 = __importDefault(require("./gamedata"));
var gameworld_1 = __importDefault(require("./gameworld"));
var rpgmaker_1 = __importDefault(require("./rpgmaker"));
var MMO_Core = /** @class */ (function () {
    function MMO_Core() {
        this.socket = new socket_1.default();
        this.database = new database_1.default();
        this.gamedata = new gamedata_1.default();
        this.gameworld = new gameworld_1.default();
        this.rpgmaker = new rpgmaker_1.default(this.gameworld);
    }
    MMO_Core.getInstance = function () {
        if (this._instance) {
            return this._instance;
        }
        this._instance = new MMO_Core();
        return this._instance;
    };
    return MMO_Core;
}());
exports.default = MMO_Core;
