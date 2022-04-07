import Socket from './socket';
import Database from './database';
import GameData from './gamedata';
import GameWorld from './gameworld';
import Rpgmaker from './rpgmaker';
import pino from 'pino';
import pinoms from 'pino-multi-stream';
import Logger = pino.Logger;
import * as fs from 'fs';

export default class MMO_Core {
    private static _instance: MMO_Core;
    public socket: Socket;
    public database: Database;
    public gamedata: GameData;
    public gameworld: GameWorld;
    public rpgmaker: Rpgmaker;
    public logger: Logger;

    private constructor() {
        // Initialize Logger
        const fullDate = new Date();
        const todaysDate = `${fullDate.getFullYear()}-${fullDate.getMonth()}-${fullDate.getDate()}`;
        const streams = [
            { stream: fs.createWriteStream(`${todaysDate}.log`) },
            {
                stream: pinoms.prettyStream({
                    prettyPrint: {
                        colorize: true,
                        translateTime: 'SYS:standard',
                        ignore: 'pid,hostname',
                    },
                }),
            },
        ];
        this.logger = pinoms({ streams: streams });
        this.logger.level = process.env.PINO_LOG_LEVEL ? process.env.PINO_LOG_LEVEL : 'trace';
        this.socket = new Socket();
        this.database = new Database(this.logger);
        this.gamedata = new GameData(this.logger);
        this.gameworld = new GameWorld(this.logger);
        this.rpgmaker = new Rpgmaker(this.gameworld, this.logger);
    }

    static getInstance() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new MMO_Core();
        return this._instance;
    }
}
