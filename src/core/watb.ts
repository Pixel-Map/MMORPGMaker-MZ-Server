/* eslint-disable max-len */
import MMO_Core from './mmo_core';
import pino from 'pino';
import Logger = pino.Logger;

// ---------------------------------------
// ------ WORLD ATB by Axel Fiolle
// ---------------------------------------

import { BaseStats as Stats } from './rpgmaker';

interface ATBAction {
    formula: string;
    type: number;
    from: string | number;
    to: string | number;
    atTurn: number;
    date: Date;
    effect?: Stats;
}

interface ATBActor extends Stats {
    enemyId?: number; // if from game datas
    playerId?: string;
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

export default class WorldATB {
    public fights: Array<ATBInstance> = []; // All the fights that are currently running

    private socket: any;
    private rpgmaker: any;
    private gamedata: any;
    private world: any;
    private gameTroops: Array<any>;
    private gameEnemies: Array<any>;
    private gameArmors: Array<any>;
    private gameItems: Array<any>;
    private gameWeapons: Array<any>;
    private gameSkills: Array<any>;
    private gameClasses: Array<any>;
    private logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    initialize(mmoCore: MMO_Core) {
        this.logger.info('[WATB] World ATB by Axel Fiolle');
        this.socket = mmoCore.socket;
        this.rpgmaker = mmoCore.rpgmaker;
        this.gamedata = mmoCore.gamedata;
        this.world = mmoCore.gameworld;
        this.gameTroops = this.gamedata.troops;
        this.gameEnemies = this.gamedata.enemies;
        this.gameArmors = this.gamedata.armors;
        this.gameItems = this.gamedata.items;
        this.gameWeapons = this.gamedata.weapons;
        this.gameSkills = this.gamedata.skills;
        this.gameClasses = this.gamedata.classes;
        this.logger.info('[WATB] World ATB system is UP !');
    }

    // Global helpers
    getFightInstance = (uniqueId: string): ATBInstance => this.fights.find((f) => f.uniqueId === uniqueId);
    findArmor = (dbId: number) => this.gameArmors.find((el) => el.id === dbId);
    findEnemy = (dbId: number) => this.gameEnemies.find((el) => el.id === dbId);
    findItem = (dbId: number) => this.gameItems.find((el) => el.id === dbId);
    findSkill = (dbId: number) => this.gameSkills.find((el) => el.id === dbId);
    findWeapon = (dbId: number) => this.gameWeapons.find((el) => el.id === dbId);
    findPlayerClass = (dbId: number) => this.gameClasses.find((el) => el.id === dbId);

    isInitiator = (uniqueId: string, instanceUniqueId: string): boolean =>
        this.getFightInstance(instanceUniqueId)?.initiator === uniqueId;

    // Core ATB functions
    makeInstanceActor = (props: { playerId?: string; enemyId?: number }): ATBActor => {
        let _nodePlayer = null,
            _enemyData = null,
            playerUniqueId: string | null = null,
            response: any;

        const collectDatas = (getStatsFrom, uniqueId: string | number): ATBActor => {
            // collect stats from object
            const hp: number = getStatsFrom.hp || 0;
            const mp: number = getStatsFrom.mp || 0;
            const mhp: number = getStatsFrom.mhp || 0;
            const mpm: number = getStatsFrom.mpm || 0;
            const atk: number = getStatsFrom.atk || 0;
            const def: number = getStatsFrom.def || 0;
            const mAtk: number = getStatsFrom.mAtk || 0;
            const mDef: number = getStatsFrom.mDef || 0;
            const agi: number = getStatsFrom.agi || 0;
            const luck: number = getStatsFrom.luck || 0;
            const level: number = getStatsFrom.level || 0;
            const status: number = getStatsFrom.status || 0;
            return {
                enemyId: typeof uniqueId === 'number' ? uniqueId : null,
                playerId: typeof uniqueId === 'string' ? uniqueId : null,
                hp,
                mp,
                mhp,
                mpm,
                atk,
                def,
                mAtk,
                mDef,
                agi,
                luck,
                level,
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

    // EVENTs
    makePlayerDead = async (username: string, reason = 'fainted') => {
        this.world.emitToPlayerByUsername(username, 'bang', reason);
    };

    // MATHS helper
    applyStatsFormula = (formula: string, source: ATBActor, target: ATBActor, type = 1): Stats =>
        this.rpgmaker.applyStatsFormula(formula, source, target, type);

    affectPlayerStats = (username: string, formulaResult: any) =>
        this.rpgmaker.affectPlayerStats(username, formulaResult);
}
