"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const { socket } = require('./core/socket');
var socket_io_1 = __importDefault(require("socket.io"));
var mmo_core_1 = __importDefault(require("./core/mmo_core"));
require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var server = require('http').createServer(app);
var io = new socket_io_1.default(server);
var mmoCore = mmo_core_1.default.getInstance();
/*****************************
 STARTING THE SERVER
 *****************************/
// Express settings
app.use('/admin/bower_components', express.static(path.join(process.cwd(), 'bower_components')));
app.use(express.static(path.join(__dirname, 'admin')));
app.use(bodyParser.json({ limit: '2mb' })); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '2mb',
})); // to support URL-encoded bodies
app.use(function (req, res, next) {
    // CORS (read : https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS)
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    next();
});
console.log('######################################');
console.log('# MMORPG Maker MV - Samuel Lespes Cardillo');
console.log('# Check GitHub for updates');
console.log('######################################');
try {
    // Core
    var routes_1 = require('./core/routes');
    mmoCore.database.initialize();
    // Initializing the database
    // Initializing server config
    var port = process.env.PORT ? process.env.PORT : 8097;
    server.listen(port); // Listen configured port
    console.log('Listening on port: ' + port);
    mmoCore.socket.initialize(io, mmoCore).then(function () {
        // Initalizing the socket-side of the server
        routes_1.initialize(app, mmoCore.database.SERVER_CONFIG, function () {
            // Initializing the RESTFUL API
            mmoCore.gameworld.initialize(mmoCore); // Initializing world environment
        });
    });
}
catch (err) {
    console.log(err);
    mmoCore.socket.modules.player.subs.auth.saveWorld();
    server.instance.close();
}
process.on('SIGINT', function () {
    var security = require('./core/security');
    console.log('Caught interrupt signal');
    mmoCore.socket.modules.player.subs.auth.saveWorld();
    security.saveTokens(mmoCore.database);
    process.exit();
});
