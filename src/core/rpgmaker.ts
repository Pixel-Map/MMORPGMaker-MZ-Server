/*****************************
 RPG Maker Core Mock by Axel Fiolle
 *****************************/
import MMO_Core from './mmo_core';
import pino from 'pino';
import Logger = pino.Logger;

interface Stats {
    hp: number;
    mp: number;
    mhp: number;
    mpm: number;
    level: number;
    atk: number;
    def: number;
    mAtk: number;
    mDef: number;
    agi: number;
    luck: number;
}
export default class Rpgmaker {
    private socket;
    // private watb;
    private gameworld;
    private logger: Logger;
    constructor(mmoCore: MMO_Core, logger: Logger) {
        this.socket = mmoCore.socket;
        // this.watb = mmoCore.watb;
        this.gameworld = mmoCore.gameworld;
        this.logger = logger;
    }

    _canPass(initiator, direction) {
        if (!initiator || !direction) return false;
        const _coords = {
            x: initiator.x,
            y: initiator.y,
        };
        const _mapId = this.gameworld.getNpcMapId(initiator.uniqueId);
        const x2 = this._roundXWithDirection(_mapId, _coords.x, direction);
        const y2 = this._roundYWithDirection(_mapId, _coords.y, direction);
        if (!this._isValid(_mapId, _coords.x, _coords.y) || !this._isValid(_mapId, x2, y2)) {
            this.logger.trace(initiator.uniqueId, '!maker._isValid(_mapId, x2, y2)', _mapId, x2, y2);
            return false;
        }
        if (initiator._through) return true;
        if (!this._isMapPassable(_mapId, _coords.x, _coords.y, direction)) {
            this.logger.trace(
                initiator.uniqueId,
                '!maker._isMapPassable(_mapId, _coords.x, _coords.y, direction)',
                _mapId,
                _coords.x,
                _coords.y,
                direction,
            );
            return false;
        }
        return !this._isCollidedWithCharacters(_mapId, x2, y2, initiator);
    }

    _getReverseDir(direction) {
        if (direction === 1) return 9;
        if (direction === 2) return 8;
        if (direction === 3) return 7;
        if (direction === 4) return 6;
        if (direction === 6) return 4;
        if (direction === 7) return 3;
        if (direction === 8) return 2;
        if (direction === 9) return 1;
        return false;
    }

    _isValid(mapId, targetX, targetY) {
        if (targetX < 0 || targetY < 0) return false;
        const _map = this.gameworld.getMapById(mapId);
        return !(targetX >= _map.width || targetY >= _map.height);
    }

    _isMapPassable(mapId, x, y, d) {
        const x2 = this._roundXWithDirection(mapId, x, d);
        const y2 = this._roundYWithDirection(mapId, y, d);
        const d2 = this._getReverseDir(d);
        return this._isPassable(mapId, x, y, d) && this._isPassable(mapId, x2, y2, d2);
    }

    _isPassable(mapId, x, y, d) {
        return this._checkPassage(mapId, x, y, (1 << (d / 2 - 1)) & 0x0f);
    }

    _roundX(mapId, x) {
        const _map = this.gameworld.getMapById(mapId);
        return _map.scrollType === 2 || _map.scrollType === 3 ? x % _map.width : x;
    }

    _roundY(mapId, y) {
        const _map = this.gameworld.getMapById(mapId);
        return _map.scrollType === 2 || _map.scrollType === 3 ? y % _map.height : y;
    }

    _xWithDirection(x, d) {
        return x + (d === 6 ? 1 : d === 4 ? -1 : 0);
    }

    _yWithDirection(y, d) {
        return y + (d === 2 ? 1 : d === 8 ? -1 : 0);
    }

    _roundXWithDirection(mapId, x, d) {
        return this._roundX(mapId, x + (d === 6 ? 1 : d === 4 ? -1 : 0));
    }

    _roundYWithDirection(mapId, y, d) {
        return this._roundY(mapId, y + (d === 2 ? 1 : d === 8 ? -1 : 0));
    }

    __tilesetId(mapId, x, y) {
        return this._layeredTiles(mapId, x, y);
    }

    _tilesetFlags(mapId) {
        const tileset = this.gameworld.tileSets[this.gameworld.getMapById(mapId)]?.tilesetId;
        if (tileset) {
            return tileset.flags;
        } else {
            return [];
        }
    }

    _tileId(mapId, x, y, z) {
        const _map = this.gameworld.getMapById(mapId);
        const width = _map.width;
        const height = _map.height;
        return _map.data[(z * height + y) * width + x] || 0;
    }

    _layeredTiles(mapId, x, y) {
        const tiles = [];
        for (let i = 0; i < 4; i++) {
            tiles.push(this._tileId(mapId, x, y, 3 - i));
        }
        return tiles;
    }

    _checkPassage(mapId, x, y, bit) {
        const flags = this._tilesetFlags(mapId);
        const tiles = this.gameworld.mapTileFinder(mapId, x, y);
        for (const tile of tiles) {
            const flag = flags[tile];
            if ((flag & 0x10) !== 0) {
                // [*] No effect on passage
                continue;
            }
            if ((flag & bit) === 0) {
                // [o] Passable
                return true;
            }
            if ((flag & bit) === bit) {
                // [x] Impassable
                return false;
            }
        }
        return false;
    }

    _isCollidedWithCharacters(mapId, x, y, initiator) {
        //socket.modules.player.subs.player.getPlayer()
        if (!this.gameworld.getMapById(mapId)) return; // prevent .find() on null
        const hasSameCoords = (_event) => _event.x && _event.y && _event.x === x && _event.y === y;
        const isOriginalElement = (_event) => initiator && _event.id === initiator.id;
        return this.gameworld
            .getAllEntitiesByMapId(mapId)
            .find((obj) => obj && !obj._through && hasSameCoords(obj) && !isOriginalElement(obj));
    }

    applyStatsFormula = (formula: string, source: Stats, target: Stats, type = 1): Stats => {
        const { evaluate } = require('mathjs');

        const scope = {
            a: {
                hp: source.hp,
                mp: source.mp,
                mhp: source.mhp,
                mmp: source.mpm,
                atk: source.atk,
                def: source.def,
                mat: source.mAtk,
                mdf: source.mDef,
                agi: source.agi,
                luk: source.luck,
                level: source.level,
            },
            b: {
                hp: target.hp,
                mp: target.mp,
                mhp: target.mhp,
                mmp: target.mpm,
                atk: target.atk,
                def: target.def,
                mat: target.mAtk,
                mdf: target.mDef,
                agi: target.agi,
                luk: target.luck,
                level: target.level,
            },
        };

        const stats = { 1: 'hp', 2: 'mp', 3: 'hp', 4: 'mp', 5: 'hp', 6: 'mp' };
        const factors = { 1: -1, 2: -1, 3: 1, 4: 1, 5: -1, 6: -1 };
        const delta: Stats = {
            hp: 0,
            mp: 0,
            mhp: 0,
            mpm: 0,
            level: 0,
            atk: 0,
            def: 0,
            mAtk: 0,
            mDef: 0,
            agi: 0,
            luck: 0,
        };
        delta[stats[type]] = evaluate(formula, scope) > 0 ? evaluate(formula, scope) * factors[type] : 0;

        return delta;
    };

    affectPlayerStats = async (username: string, formulaResult: any) => {
        const players = await this.socket.modules.player.subs.player.getPlayers();
        for (const key of Object.keys(formulaResult)) {
            if (players[username.toLowerCase()].playerData.stats[key]) {
                players[username.toLowerCase()].playerData.stats[key] += formulaResult[key];
            }
        }
        if (
            players[username.toLowerCase()].playerData.stats.hp > players[username.toLowerCase()].playerData.stats.mhp
        ) {
            players[username.toLowerCase()].playerData.stats.hp = players[username.toLowerCase()].playerData.stats.mhp;
        }
        if (
            players[username.toLowerCase()].playerData.stats.mp > players[username.toLowerCase()].playerData.stats.mpm
        ) {
            players[username.toLowerCase()].playerData.stats.mp = players[username.toLowerCase()].playerData.stats.mpm;
        }
        if (players[username.toLowerCase()].playerData.permission < 100) {
            // if (players[username.toLowerCase()].playerData.stats.hp <= 0) {
            //     this.watb.makePlayerDead(username, 'fainted');
            // }
        }
        const _result = players[username.toLowerCase()];
        this.gameworld.emitToPlayerByUsername(username, 'stats_update', _result);

        return _result;
    };
}
