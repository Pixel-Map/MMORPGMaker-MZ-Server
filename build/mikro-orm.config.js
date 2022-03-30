"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var User_1 = require("./entities/User");
var Skin_1 = require("./entities/Skin");
var Stats_1 = require("./entities/Stats");
exports.default = {
    entities: [User_1.User, Skin_1.Skin, Stats_1.Stats],
    type: 'postgresql',
    dbName: 'postgres',
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password', // one of `mongo` | `mysql` | `mariadb` | `postgresql` | `sqlite`
};
