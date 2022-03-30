"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Rpgmaker = /** @class */ (function () {
    function Rpgmaker(gameworld) {
        this.gameworld = gameworld;
    }
    Rpgmaker.prototype._canPass = function (initiator, direction) {
        if (!initiator || !direction)
            return false;
        var _coords = {
            x: initiator.x,
            y: initiator.y,
        };
        var _mapId = this.gameworld.getNpcMapId(initiator.uniqueId);
        var x2 = this._roundXWithDirection(_mapId, _coords.x, direction);
        var y2 = this._roundYWithDirection(_mapId, _coords.y, direction);
        if (!this._isValid(_mapId, _coords.x, _coords.y) || !this._isValid(_mapId, x2, y2)) {
            // console.log(initiator.uniqueId, '!maker._isValid(_mapId, x2, y2)', _mapId, x2, y2)
            return false;
        }
        if (initiator._through)
            return true;
        if (!this._isMapPassable(_mapId, _coords.x, _coords.y, direction)) {
            // console.log(initiator.uniqueId, '!maker._isMapPassable(_mapId, _coords.x, _coords.y, direction)',
            // _mapId, _coords.x, _coords.y, direction)
            return false;
        }
        return !this._isCollidedWithCharacters(_mapId, x2, y2, initiator);
    };
    Rpgmaker.prototype._getReverseDir = function (direction) {
        if (direction === 1)
            return 9;
        if (direction === 2)
            return 8;
        if (direction === 3)
            return 7;
        if (direction === 4)
            return 6;
        if (direction === 6)
            return 4;
        if (direction === 7)
            return 3;
        if (direction === 8)
            return 2;
        if (direction === 9)
            return 1;
        return false;
    };
    Rpgmaker.prototype._isValid = function (mapId, targetX, targetY) {
        if (targetX < 0 || targetY < 0)
            return false;
        var _map = this.gameworld.getMapById(mapId);
        return !(targetX >= _map.width || targetY >= _map.height);
    };
    Rpgmaker.prototype._isMapPassable = function (mapId, x, y, d) {
        var x2 = this._roundXWithDirection(mapId, x, d);
        var y2 = this._roundYWithDirection(mapId, y, d);
        var d2 = this._getReverseDir(d);
        return this._isPassable(mapId, x, y, d) && this._isPassable(mapId, x2, y2, d2);
    };
    Rpgmaker.prototype._isPassable = function (mapId, x, y, d) {
        return this._checkPassage(mapId, x, y, (1 << (d / 2 - 1)) & 0x0f);
    };
    Rpgmaker.prototype._roundX = function (mapId, x) {
        var _map = this.gameworld.getMapById(mapId);
        return _map.scrollType === 2 || _map.scrollType === 3 ? x % _map.width : x;
    };
    Rpgmaker.prototype._roundY = function (mapId, y) {
        var _map = this.gameworld.getMapById(mapId);
        return _map.scrollType === 2 || _map.scrollType === 3 ? y % _map.height : y;
    };
    Rpgmaker.prototype._xWithDirection = function (x, d) {
        return x + (d === 6 ? 1 : d === 4 ? -1 : 0);
    };
    Rpgmaker.prototype._yWithDirection = function (y, d) {
        return y + (d === 2 ? 1 : d === 8 ? -1 : 0);
    };
    Rpgmaker.prototype._roundXWithDirection = function (mapId, x, d) {
        return this._roundX(mapId, x + (d === 6 ? 1 : d === 4 ? -1 : 0));
    };
    Rpgmaker.prototype._roundYWithDirection = function (mapId, y, d) {
        return this._roundY(mapId, y + (d === 2 ? 1 : d === 8 ? -1 : 0));
    };
    Rpgmaker.prototype.__tilesetId = function (mapId, x, y) {
        return this._layeredTiles(mapId, x, y);
    };
    Rpgmaker.prototype._tilesetFlags = function (mapId) {
        var tileset = this.gameworld.tileSets[this.gameworld.getMapById(mapId)].tilesetId;
        if (tileset) {
            return tileset.flags;
        }
        else {
            return [];
        }
    };
    Rpgmaker.prototype._tileId = function (mapId, x, y, z) {
        var _map = this.gameworld.getMapById(mapId);
        var width = _map.width;
        var height = _map.height;
        return _map.data[(z * height + y) * width + x] || 0;
    };
    Rpgmaker.prototype._layeredTiles = function (mapId, x, y) {
        var tiles = [];
        for (var i = 0; i < 4; i++) {
            tiles.push(this._tileId(mapId, x, y, 3 - i));
        }
        return tiles;
    };
    Rpgmaker.prototype._checkPassage = function (mapId, x, y, bit) {
        var flags = this._tilesetFlags(mapId);
        var tiles = this.gameworld.mapTileFinder(mapId, x, y);
        for (var _i = 0, tiles_1 = tiles; _i < tiles_1.length; _i++) {
            var tile = tiles_1[_i];
            var flag = flags[tile];
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
    };
    Rpgmaker.prototype._isCollidedWithCharacters = function (mapId, x, y, initiator) {
        //socket.modules.player.subs.player.getPlayer()
        if (!this.gameworld.getMapById(mapId))
            return; // prevent .find() on null
        var hasSameCoords = function (_event) { return _event.x && _event.y && _event.x === x && _event.y === y; };
        var isOriginalElement = function (_event) { return initiator && _event.id === initiator.id; };
        return this.gameworld
            .getAllEntitiesByMapId(mapId)
            .find(function (obj) { return obj && !obj._through && hasSameCoords(obj) && !isOriginalElement(obj); });
    };
    return Rpgmaker;
}());
exports.default = Rpgmaker;
