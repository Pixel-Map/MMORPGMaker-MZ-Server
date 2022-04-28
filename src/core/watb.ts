import MMO_Core from './mmo_core';
import pino from 'pino';
import Logger = pino.Logger;

// ---------------------------------------
// ------ WORLD ATB by Axel Fiolle
// ---------------------------------------

interface ATBActor {
    enemyId?: number; // if from game datas
    playerId?: string;
    hp: number;
    mp: number;
    mhp: number;
    mmp: number;
    atk: number;
    def: number;
    matk: number;
    mdef: number;
    agi: number;
    luck: number;
    status: number;
    isPlaying?: boolean;
    killedBy?: string; // player unique ID
}

interface ATBInstance {
    uniqueId: string;
    nodeId: string;
    initiator: string | number; // playerUniqueId or a gameEnemy ID
    actors: Array<ATBActor>;
    turn: number;
    startedAt: Date;
    isPublic?: boolean;
    privateParty?: string; // parties have textual IDs
    mapId?: number;
    mapX?: number;
    mapY?: number;
    troopId?: number;
    combat?: {
        initiator: any;
        state: any;
        members: any;
        actions: any;
    };
}

interface makeActorProps {
    playerId?: string;
    enemyId?: number;
}

export default class WorldATB {
    public fights: Array<ATBInstance> = []; // All the fights that are currently running

    private socket: any;
    private rpgmaker: any;
    private gamedata: any;
    private world: any;
    private gameTroops: Array<any>;
    private gameEnemies: Array<any>;
    private logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    initialize(mmoCore: MMO_Core) {
        this.socket = mmoCore.socket;
        this.rpgmaker = mmoCore.rpgmaker;
        this.gamedata = mmoCore.gamedata;
        this.world = mmoCore.gameworld;
        this.gameTroops = this.gamedata.troops;
        this.gameEnemies = this.gamedata.enemies;
        this.logger.info('[WORLD] ATB system is UP !');
    }

    // Global helpers
    getFightInstance = (uniqueId: string): ATBInstance => this.fights.find((f) => f.uniqueId === uniqueId);

    isInitiator = (uniqueId: string, instanceUniqueId: string): boolean =>
        this.getFightInstance(instanceUniqueId)?.initiator === uniqueId;

    // Core ATB functions
    makeInstanceActor = (props: makeActorProps): ATBActor => {
        let _nodePlayer = null,
            _enemyData = null,
            playerUniqueId: string | null = null,
            response: any;

        const collectDatas = (getStatsFrom, uniqueId: string | number): ATBActor => {
            // collect stats from object
            const hp: number = getStatsFrom.hp || 0;
            const mp: number = getStatsFrom.mp || 0;
            const mhp: number = getStatsFrom.mhp || 0;
            const mmp: number = getStatsFrom.mmp || 0;
            const atk: number = getStatsFrom.atk || 0;
            const def: number = getStatsFrom.def || 0;
            const matk: number = getStatsFrom.matk || 0;
            const mdef: number = getStatsFrom.mdef || 0;
            const agility: number = getStatsFrom.agility || 0;
            const luck: number = getStatsFrom.luck || 0;
            const status: number = getStatsFrom.status || 0;
            return {
                enemyId: typeof uniqueId === 'number' ? uniqueId : null,
                playerId: typeof uniqueId === 'string' ? uniqueId : null,
                hp,
                mp,
                mhp,
                mmp,
                atk,
                def,
                matk,
                mdef,
                agi: agility,
                luck,
                status,
            };
        };

        if (props.playerId) {
            _nodePlayer = this.world.getNodeBy('playerId', props.playerId);
            playerUniqueId = _nodePlayer.playerId;
            response = collectDatas(_nodePlayer, playerUniqueId);
        } else if (props.enemyId) {
            _enemyData = this.gameEnemies[props.enemyId];
            response = collectDatas(_enemyData, props.enemyId);
        }

        return response;
    };

    makeFightInstance = (initiator: string | number, playerIds: Array<string> = [], troopId?: number): ATBInstance => {
        const instanceUniqueId = `ATB#${this.fights.length}T${new Date().getTime()}`;

        const actors = [];
        actors.push(
            // Add initiator as first actor
            this.makeInstanceActor({
                enemyId: typeof initiator === 'number' ? initiator : null,
                playerId: typeof initiator === 'string' ? initiator : null,
            }),
        );

        playerIds.map((playerId) => {
            if (playerId !== initiator) actors.push(this.makeInstanceActor({ playerId }));
        });
        if (troopId) {
            // fetch all enemies from the troop to add every Enemy in instance actors
            this.gameTroops[troopId]?.members?.map(({ enemyId }) => {
                if (enemyId !== initiator) actors.push(this.makeInstanceActor({ enemyId }));
            });
        }

        const _newInstance: ATBInstance = {
            // generate object
            uniqueId: instanceUniqueId,
            nodeId: '',
            initiator: initiator || 'server',
            actors,
            turn: 0,
            startedAt: new Date(),
            troopId,
        };

        const _prepareNode = Object.assign(
            // Assign the nodeType before attaching to a node
            {
                nodeType: 'atbInstance',
            },
            _newInstance,
        );
        // Attach to a node
        const node = this.world.attachNode(_prepareNode); // make, attach and get detals
        _newInstance.nodeId = node.uniqueId; // attach the node Id to instance

        this.fights.push(_newInstance);

        this.logger.info('[WATB] makeFightInstance', _newInstance.uniqueId);
        return _newInstance;
    };

    startFight = (fightUniqueId: string) => {
        this.logger.info('[WATB] startFight', fightUniqueId);
        const _fight = this.getFightInstance(fightUniqueId);
        if (!_fight) return;

        this.getFightInstance(fightUniqueId)
            .actors.filter((actor) => !!actor.playerId)
            .map((player) => {
                const _playerNode = this.world.getNodeBy('playerId', player.playerId);
                this.world.mutateNode(_playerNode, { atbUniqueId: _fight.uniqueId });
            });
        // Attach the RPG Maker fight engine
        this.getFightInstance(fightUniqueId).combat = {
            initiator: _fight.actors[0],
            state: this.gameTroops[_fight.troopId],
            members: {},
            actions: {},
        };
    };

    endFight = (fightUniqueId: string) => {
        this.logger.info('[WATB] endFight', fightUniqueId);
        const _fight = this.getFightInstance(fightUniqueId);
        if (!_fight) return;

        this.getFightInstance(fightUniqueId)
            .actors.filter((actor) => !!actor.playerId)
            .map((player) => {
                const _playerNode = this.world.getNodeBy('playerId', player.playerId);
                this.world.mutateNode(_playerNode, { atbUniqueId: '' });
            });

        // Free memory:
        this.fights.splice(this.fights.indexOf(_fight), 1); // remove from fights array
        this.world.removeNode(this.world.getNode(_fight.nodeId)); // clear gameworld nodes
    };
}
