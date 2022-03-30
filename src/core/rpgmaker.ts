/*****************************
 RPG Maker Core Mock by Axel Fiolle
 *****************************/
import GameWorld from './gameworld';

export default class Rpgmaker {
    private gameworld: GameWorld;

    constructor(gameworld: GameWorld) {
        this.gameworld = gameworld;
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
            // console.log(initiator.uniqueId, '!maker._isValid(_mapId, x2, y2)', _mapId, x2, y2)
            return false;
        }
        if (initiator._through) return true;
        if (!this._isMapPassable(_mapId, _coords.x, _coords.y, direction)) {
            // console.log(initiator.uniqueId, '!maker._isMapPassable(_mapId, _coords.x, _coords.y, direction)',
            // _mapId, _coords.x, _coords.y, direction)
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
        const tileset = this.gameworld.tileSets[this.gameworld.getMapById(mapId)].tilesetId;
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
}
