import { LoadStrategy, MikroORM, wrap } from '@mikro-orm/core';
import type { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Player } from '../entities/Player';
import { Skin } from '../entities/Skin';
import { Stats } from '../entities/Stats';
import pino from 'pino';
import Logger = pino.Logger;
import { ServerConfig } from '../entities/ServerConfig';
import { PocketEvent } from '../entities/PocketEvent';
import { MMO_NPC } from '../plugins/MMO_Core_NPCs';
import { House } from '../entities/House';
import { YarnSpinnerStorage } from '../entities/YarnSpinnerStorage';

const security = require('./security');

export default class Database {
    logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    private orm: MikroORM;
    public SERVER_CONFIG: ServerConfig = {
        id: 1,
        newPlayerDetails: {
            permission: 0,
            mapId: 1,
            x: 5,
            y: 5,
        },
        globalSwitches: new Map(),
        partySwitches: new Map(),
        globalVariables: new Map(),
        offlineMaps: new Map(),
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
        const users = await userRepository.find(
            { id: userId },
            {
                limit: 1,
                populate: ['skin', 'stats'],
            },
        );
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
            mapId: this.SERVER_CONFIG.newPlayerDetails.mapId,
            x: this.SERVER_CONFIG.newPlayerDetails.x,
            y: this.SERVER_CONFIG.newPlayerDetails.y,
            permission: this.SERVER_CONFIG.newPlayerDetails.permission,
        });

        await userRepository.persistAndFlush(user);
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
        await userRepository.persistAndFlush(user[0]);
    }

    async savePlayerById(playerData) {
        const em = this.orm.em.fork();
        const userRepository = em.getRepository(Player);
        const user = await userRepository.find({ id: playerData.id }, { limit: 1 });
        wrap(user[0]).assign(playerData, { em: em });
    }

    /// ////////////// BANKS
    getBanks(callback) {
        callback();
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
        callback();
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
        callback();
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
        callback();
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
        callback();
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
        callback();
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

    async deletePocketEvent(uniqueId) {
        const em = this.orm.em.fork();
        const pocketEventRepository = em.getRepository(PocketEvent);
        const event = await pocketEventRepository.findOne({ uniqueId: uniqueId });
        pocketEventRepository.removeAndFlush(event);
    }

    // Begin tracking a new persistent event (i.e. an item placed on the map)
    async addPocketEvent(eventData: PocketEvent) {
        const em = this.orm.em.fork();
        const pocketEventRepository = em.getRepository(PocketEvent);

        const event = pocketEventRepository.create(eventData);

        pocketEventRepository.persistAndFlush(event);
    }

    async getPocketEvents(): Promise<PocketEvent[]> {
        const em = this.orm.em.fork();
        const pocketEventRepository = em.getRepository(PocketEvent);
        return pocketEventRepository.findAll();
    }

    async updateEventVariables(event: MMO_NPC) {
        this.logger.info('Updating event variables for event: ' + event._eventId);
        const em = this.orm.em.fork();
        const eventRepository = em.getRepository(PocketEvent);
        // @ts-ignore
        const dbEvent = await eventRepository.find({ uniqueId: event._eventData.uniqueId }, { limit: 1 });
        // @ts-ignore
        dbEvent[0].variables = event.variables;
        await eventRepository.persistAndFlush(dbEvent[0]);
    }

    async getYarnStorageVariable(playerGuid, key): Promise<YarnSpinnerStorage> {
        const em = this.orm.em.fork();
        const yarnRepository = em.getRepository(YarnSpinnerStorage);
        return yarnRepository.findOne({
            player: playerGuid,
            key: key,
        });
    }

    async setYarnStorageVariable(playerGuid, key, value): Promise<YarnSpinnerStorage> {
        const em = this.orm.em.fork();
        const yarnRepository = em.getRepository(YarnSpinnerStorage);
        let currentVariable = await yarnRepository.findOne({
            player: playerGuid,
            key: key,
        });
        if (!currentVariable) {
            currentVariable = yarnRepository.create({
                player: playerGuid,
                key: key,
                value: value,
            });
        } else {
            currentVariable = yarnRepository.create({
                player: playerGuid,
                key: key,
                value: value,
            });
        }
        yarnRepository.persistAndFlush(currentVariable);
        return currentVariable;
    }

    // House Functionality
    async getHouse(id: number) {
        const em = this.orm.em.fork();
        const houseRepository = em.getRepository(House);
        let house = await houseRepository.findOne({ id: id });
        if (!house) {
            house = houseRepository.create({
                id: id,
                owner: null,
            });
            houseRepository.persistAndFlush(house);
        }
        return house;
    }

    /// ////////////// SERVER
    async reloadConfigFromDatabase() {
        this.logger.info('Reloading Config');
        const em = this.orm.em.fork();
        const serverConfigRepository = em.getRepository(ServerConfig);
        let serverConfig = await serverConfigRepository.findOne({ id: 1 });

        // If Config doesn't exist, use default!
        if (!serverConfig) {
            serverConfig = serverConfigRepository.create(this.SERVER_CONFIG);
            serverConfigRepository.persistAndFlush(serverConfig);
        }

        this.SERVER_CONFIG = serverConfig;
        this.logger.info('Config reloaded!');
    }

    async changeConfig(type, payload, callback) {
        this.logger.info('Updating server config!');

        switch (type) {
            case 'newPlayerDetails': {
                this.SERVER_CONFIG.newPlayerDetails = {
                    x: payload.x,
                    y: payload.y,
                    mapId: payload.mapId,
                    permission: payload.permission,
                };
                break;
            }
            case 'globalSwitches': {
                this.SERVER_CONFIG.globalSwitches = payload;
                break;
            }
            case 'globalVariables': {
                this.SERVER_CONFIG.globalVariables = payload;
                break;
            }
            case 'offlineMaps': {
                this.SERVER_CONFIG.offlineMaps = payload;
                break;
            }
            case 'partySwitches': {
                this.SERVER_CONFIG.partySwitches = payload;
                break;
            }
        }
        await this.saveConfig();
        callback();
    }

    async saveConfig() {
        const em = this.orm.em.fork();
        const serverConfigRepository = em.getRepository(ServerConfig);
        serverConfigRepository.persistAndFlush(this.SERVER_CONFIG);
        this.logger.info('Saved Server Config!');
    }

    close() {
        this.orm.close(true);
    }
}
