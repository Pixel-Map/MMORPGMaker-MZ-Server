require('dotenv').config();
Error.stackTraceLimit = Infinity;

import Server from 'socket.io';
import MMO_Core from './core/mmo_core';
import MapsRouter from './routes/maps';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';

const app = express();
const server = require('http').createServer(app);
const io: Server = new Server(server);
const mmoCore = MMO_Core.getInstance();
/*****************************
 STARTING THE SERVER
 *****************************/

// Express settings
app.use('/admin/bower_components', express.static(path.join(process.cwd(), 'bower_components')));
app.use(express.static(path.join(__dirname, 'admin')));
app.use(bodyParser.json({ limit: '2mb' })); // to support JSON-encoded bodies
app.use(
    bodyParser.urlencoded({
        extended: true,
        limit: '2mb',
    }),
); // to support URL-encoded bodies
app.use(function (req, res, next) {
    // CORS (read : https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS)
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    next();
});

app.use('/api/map/', MapsRouter);

mmoCore.logger.info('######################################');
mmoCore.logger.info('# MMORPG Maker MV - Samuel Lespes Cardillo');
mmoCore.logger.info('# Check GitHub for updates');
mmoCore.logger.info('######################################');

try {
    // Core
    const routes = require('./core/routes');

    mmoCore.database.initialize();
    // Initializing the database
    // Initializing server config
    const port = process.env.PORT ? process.env.PORT : 8097;
    server.listen(port); // Listen configured port
    mmoCore.logger.info('Listening on port: ' + port);
    mmoCore.socket.initialize(io, mmoCore).then(() => {
        // Initalizing the socket-side of the server
        routes.initialize(app, mmoCore.database.SERVER_CONFIG, () => {
            // Initializing the RESTFUL API
            mmoCore.gameworld.initialize(mmoCore); // Initializing world environment
        });
    });
} catch (err) {
    mmoCore.logger.error(err);
    mmoCore.socket.modules.player.auth.saveWorld();
    server.instance.close();
}

process.on('SIGINT', function () {
    const security = require('./core/security');
    mmoCore.logger.info('Caught interrupt signal');
    if (mmoCore.socket.modules.player !== undefined) mmoCore.socket.modules.player.auth.saveWorld();
    security.saveTokens();
    process.exit();
});
