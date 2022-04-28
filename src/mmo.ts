require('dotenv').config();
Error.stackTraceLimit = Infinity;

import MMO_Core from './core/mmo_core';
import MapsRouter from './routes/maps';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
const cors = require('cors');

const app = express();
let Sentry;
// Use Sentry for Telemetry if enabled
if (process.env.USE_SENTRY === 'true') {
    Sentry = require('@sentry/node');
    const Tracing = require('@sentry/tracing');

    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        integrations: [
            new Sentry.Integrations.Http({ tracing: true }), // enable HTTP calls tracing
            new Tracing.Integrations.Express({ app }), // enable Express.js middleware tracing
        ],

        tracesSampleRate: 1.0, // Set tracesSampleRate to 1.0 to capture 100% of transactions for monitoring.
    });

    app.use(Sentry.Handlers.requestHandler()); // RequestHandler creates a separate execution context using domains
    app.use(Sentry.Handlers.tracingHandler()); // TracingHandler creates a trace for every incoming request
}

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: true,
        credentials: true,
        methods: ['GET, POST, OPTIONS, PUT, PATCH, DELETE'],
        allowedHeaders: ['X-Requested-With', 'X-Access-Token', 'X-Socket-ID', 'Content-Type'],
    },
});

const mmoCore = MMO_Core.getInstance();
/*****************************
 STARTING THE SERVER
 *****************************/

// Express settings
app.use(cors());
app.use('/admin/bower_components', express.static(path.join(process.cwd(), 'bower_components')));
app.use(express.static(path.join(__dirname, 'admin')));
app.use(bodyParser.json({ limit: '2mb' })); // to support JSON-encoded bodies
app.use(
    bodyParser.urlencoded({
        extended: true,
        limit: '2mb',
    }),
); // to support URL-encoded bodies

app.use('/api/map/', MapsRouter);

mmoCore.logger.info('######################################');
mmoCore.logger.info('# MMORPG Maker MV - Samuel Lespes Cardillo: https://github.com/samuelcardillo/MMORPGMaker-MV');
mmoCore.logger.info('# MMORPG Maker MZ - Axel "Andaroth" Fiolle: https://github.com/Andaroth/MMORPGMaker-MZ');
mmoCore.logger.info('# TypeScript Server by kenerwin88: https://github.com/Pixel-Map/MMORPGMaker-MZ-Server');
mmoCore.logger.info('######################################');
mmoCore.logger.info('# Check GitHub for updates');
mmoCore.logger.info('######################################');

try {
    // Core
    const routes = require('./core/routes');

    mmoCore.database.initialize();
    // Initializing the database
    // Initializing server config
    const port = process.env.PORT ? process.env.PORT : 8097;
    server.listen(port, process.env.HOST ? process.env.HOST : '0.0.0.0'); // Listen configured port
    mmoCore.logger.info('Listening on port: ' + port);
    mmoCore.socket.initialize(io, mmoCore).then(() => {
        // Initalizing the socket-side of the server
        routes.initialize(app, mmoCore.database.SERVER_CONFIG, () => {
            // Initializing the RESTFUL API
            mmoCore.gameworld.initialize(mmoCore); // Initializing world environment
            if (process.env.USE_SENTRY === 'true') {
                // The error handler must be before any other error middleware and after all controllers
                app.use(Sentry.Handlers.errorHandler());

                // Optional fallthrough error handler
                app.use(function onError(err, req, res, next) {
                    // The error id is attached to `res.sentry` to be returned
                    // and optionally displayed to the user for support.
                    res.statusCode = 500;
                    res.end(res.sentry + '\n');
                });
            }
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
