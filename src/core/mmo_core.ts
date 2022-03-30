import Socket from './socket';
import Database from './database';
import GameData from './gamedata';
import GameWorld from './gameworld';
import Rpgmaker from './rpgmaker';

export default class MMO_Core {
    private static _instance: MMO_Core;
    public socket: Socket;
    public database: Database;
    public gamedata: GameData;
    public gameworld: GameWorld;
    public rpgmaker: Rpgmaker;

    private constructor() {
        this.socket = new Socket();
        this.database = new Database();
        this.gamedata = new GameData();
        this.gameworld = new GameWorld();
        this.rpgmaker = new Rpgmaker(this.gameworld);
    }

    static getInstance() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new MMO_Core();
        return this._instance;
    }
}
