import { LoadStrategy, MikroORM, wrap } from '@mikro-orm/core';
import type { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { User } from '../entities/User';
import { Skin } from '../entities/Skin';
import { Stats } from '../entities/Stats';

const security = require('./security');

export default class Database {
    private orm: MikroORM;
    public SERVER_CONFIG = {
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

    async initialize() {
        this.orm = await MikroORM.init<PostgreSqlDriver>({
            entities: ['./build/entities'], // path to our JS entities (dist), relative to `baseDir`
            entitiesTs: ['./src/entities'], // path to our TS entities (src), relative to `baseDir`
            dbName: process.env.DATABASE_NAME,
            host: process.env.DATABASE_HOST,
            type: 'postgresql',
            user: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD,
            loadStrategy: LoadStrategy.JOINED,
            driverOptions: {
                connection: { ssl: { rejectUnauthorized: false } },
            },
        });
        // We check if the database exist
        const generator = this.orm.getSchemaGenerator();
        // await generator.dropSchema();
        // await generator.createSchema();
        await generator.updateSchema();
        console.log('[I] All good! Everything is ready for you 😘');
        console.log('[I] Database initialized with success');
    }

    async getPlayers(callback) {
        const em = this.orm.em.fork();
        const userRepository = em.getRepository(User);
        const users = await userRepository.findAll();
        return users;
    }

    async findUser(userDetails) {
        const em = this.orm.em.fork();
        const userRepository = em.getRepository(User);
        const user = await userRepository.find(
            { username: userDetails.username },
            {
                limit: 1,
                populate: ['skin', 'stats'],
            },
        );

        return user[0];
    }

    findUserById(userId, callback) {
        const em = this.orm.em.fork();
        const userRepository = em.getRepository(User);
        userRepository.find({ id: userId }, { limit: 1 }).then(function (output) {
            return callback(output);
        });
    }

    async deleteUserById(userId, callback) {
        const em = this.orm.em.fork();
        const userRepository = em.getRepository(User);
        const user = await userRepository.find({ id: userId }, { limit: 1 });
        userRepository.removeAndFlush(user).then(function (output) {
            callback(output);
        });
    }

    async registerUser(userDetails) {
        const em = this.orm.em.fork();
        const userRepository = em.getRepository(User);

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

    async savePlayer(playerData, callback) {
        console.log('Saving playerdata: ' + playerData.username);

        const em = this.orm.em.fork();
        const userRepository = em.getRepository(User);
        const user = await userRepository.find({ username: playerData.username }, { limit: 1 });
        wrap(user[0]).assign(playerData, { em: em });
        userRepository.persistAndFlush(user[0]);
    }

    async savePlayerById(playerData, callback) {
        const em = this.orm.em.fork();
        const userRepository = em.getRepository(User);
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

    changeConfig(type, payload, callback) {
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
}
