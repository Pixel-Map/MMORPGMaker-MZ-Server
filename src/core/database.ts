import { LoadStrategy, MikroORM, wrap } from '@mikro-orm/core';
import type { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Player } from '../entities/Player';
import { Skin } from '../entities/Skin';
import { Stats } from '../entities/Stats';
import pino from 'pino';
import Logger = pino.Logger;
import { ServerConfig } from '../entities/ServerConfig';
const security = require('./security');

export default class Database {
    logger: Logger;
    constructor(logger: Logger) {
        this.logger = logger;
    }
    private orm: MikroORM;
    public SERVER_CONFIG = {
        newPlayerDetails: {
            permission: 0,
            mapId: 1,
            x: 5,
            y: 5,
        },
        globalSwitches: {},
        partySwitches: {},
        globalVariables: {},
        offlineMaps: {},
    };

    async initialize() {
        let connectionOptions: any = {};

        if (process.env.DATABASE_SSL == 'true') {
            connectionOptions = { ssl: { rejectUnauthorized: false } };
        } else {
            connectionOptions = {
                ssl: false,
            };
        }
        this.orm = await MikroORM.init<PostgreSqlDriver>({
            entities: ['./dist/entities'], // path to our JS entities (dist), relative to `baseDir`
            entitiesTs: ['./src/entities'], // path to our TS entities (src), relative to `baseDir`
            dbName: process.env.DATABASE_NAME,
            host: process.env.DATABASE_HOST,
            type: process.env.DATABASE_TYPE as
                | 'mongo'
                | 'mysql'
                | 'mariadb'
                | 'postgresql'
                | 'sqlite'
                | 'better-sqlite',
            user: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD,
            loadStrategy: LoadStrategy.JOINED,
            driverOptions: {
                connection: connectionOptions,
            },
        });
        // We check if the database exist
        const generator = this.orm.getSchemaGenerator();
        await generator.updateSchema();
        this.logger.info('[I] All good! Everything is ready for you 😘');
        this.logger.info('[I] Database initialized with success');
    }

    getPlayers() {
        const em = this.orm.em.fork();
        const playerRepository = em.getRepository(Player);
        return playerRepository.findAll();
    }

    async findUser(userDetails) {
        const em = this.orm.em.fork();
        const userRepository = em.getRepository(Player);
        const user = await userRepository.find(
            { username: userDetails.username },
            {
                limit: 1,
                populate: ['skin', 'stats'],
            },
        );

        return user[0];
    }

    async findUserById(userId) {
        const em = this.orm.em.fork();
        const userRepository = em.getRepository(Player);
        const users = await userRepository.find({ id: userId }, { limit: 1, populate: ['skin', 'stats'] });
        return users[0];
    }

    async deleteUserById(userId, callback) {
        const em = this.orm.em.fork();
        const userRepository = em.getRepository(Player);
        const user = await userRepository.find({ id: userId }, { limit: 1 });
        userRepository.removeAndFlush(user).then(function (output) {
            callback(output);
        });
    }

    async registerUser(userDetails) {
        const em = this.orm.em.fork();
        const userRepository = em.getRepository(Player);

        const skin = new Skin();
        const stats = new Stats();
        const user = userRepository.create({
            username: userDetails.username,
            password: security.hashPassword(userDetails.password.toLowerCase()),
            skin: skin,
            stats: stats,
        });

        userRepository.persistAndFlush(user);
    }

    async savePlayer(playerData) {
        this.logger.info('Saving playerdata: ' + playerData.username);

        if (typeof playerData.status === 'boolean') {
            throw new Error('E3333');
        }

        const em = this.orm.em.fork();
        const userRepository = em.getRepository(Player);
        const user = await userRepository.find({ username: playerData.username }, { limit: 1 });
        wrap(user[0]).assign(playerData, { em: em });
        userRepository.persistAndFlush(user[0]);
    }

    async savePlayerById(playerData) {
        const em = this.orm.em.fork();
        const userRepository = em.getRepository(Player);
        const user = await userRepository.find({ id: playerData.id }, { limit: 1 });
        wrap(user[0]).assign(playerData, { em: em });
    }

    /// ////////////// BANKS
    getBanks(callback) {
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
    }

    getBank(bankName, callback) {
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
    }

    getBankById(bankId, callback) {
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
    }

    saveBank(bank, callback) {
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
    }

    createBank(payload, callback) {
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
    }

    deleteBank(bankId, callback) {
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
    }

    /// ////////////// SERVER
    async reloadConfig() {
        this.logger.info('Reloading Config');
        const em = this.orm.em.fork();
        const serverConfigRepository = em.getRepository(ServerConfig);
        let serverConfig = await serverConfigRepository.findOne({ id: 1 });
        if (!serverConfig) {
            serverConfig = serverConfigRepository.create({
                mapId: this.SERVER_CONFIG.newPlayerDetails.mapId,
                permission: this.SERVER_CONFIG.newPlayerDetails.permission,
                x: this.SERVER_CONFIG.newPlayerDetails.x,
                y: this.SERVER_CONFIG.newPlayerDetails.y,
            });
            serverConfigRepository.persistAndFlush(serverConfig);
        }

        this.SERVER_CONFIG.newPlayerDetails = serverConfig;
        console.log(this.SERVER_CONFIG);
    }

    changeConfig(type, payload, callback) {
        console.log(payload);
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
    }

    saveConfig() {
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
    }

    close() {
        this.orm.close(true);
    }
}
