"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mmo_core_1 = __importDefault(require("./mmo_core"));
/*****************************
 GAME WORLD by Axel Fiolle

 - Will allow you to synchronize NPCs inter/actions through multiple clients

 i. A connected map must include "<Sync>" inside its note.
 i. A connected NPC must include "<Sync>" in a comment in any page.

 i. The Spawn map must have "<Summon>" inside its note
 i. There must be only one spawn map
 i. Command to summon : /addNpc [eventId*] [mapId] [x] [y]

 *****************************/
var security = require('./security');
var GameWorld = /** @class */ (function () {
    function GameWorld() {
        var _this = this;
        this.nodes = []; // Nodes will track every connected entity
        this.gameMaps = []; // Formated exploitable files from gamedata
        this.instanceableMaps = []; // Formated maps to track players and npcs
        this.instancedMaps = []; // Maps that are currently up and synced
        this.tileSets = []; // Needed to test collisions
        this.spawnedUniqueIds = []; // Helper to find spawned NPCs without uniqueId
        this.removeNode = function (node) {
            if (!node || !node.uniqueId)
                return;
            return _this.nodes.splice(_this.nodes.indexOf(_this.getNode(node.uniqueId)), 1);
        };
        this.mutateNode = function (node, props) {
            if (!node || !node.uniqueId || !_this.getNode(node.uniqueId))
                return;
            var _loop_1 = function (key) {
                // Prevent assigning protected or not existing keys :
                var protectedKeys = [
                    'uniqueId',
                    'type',
                    'playerId',
                    'instanceUniqueId',
                    'npcUniqueId',
                    'actionUniqueId',
                    'assetUniqueId',
                ];
                if (protectedKeys.includes(key) || !Object.keys(_this.getNode(node.uniqueId)).find(function (k) { return k === key; })) {
                    security.createLog("Invalid Key \"".concat(key, "\" assignation on Node ").concat(node.uniqueId), 'error');
                    return { value: void 0 };
                }
            };
            for (var _i = 0, _a = Object.keys(props); _i < _a.length; _i++) {
                var key = _a[_i];
                var state_1 = _loop_1(key);
                if (typeof state_1 === "object")
                    return state_1.value;
            }
            return Object.assign(_this.getNode(node.uniqueId), props);
        };
        /*************************************************************************************** Maps Operations */
        this.fetchMaps = function () {
            console.log('[WORLD] Loading world maps');
            _this.gameMaps = [];
            // use the file name as key in the loop, keeping only filename starting with "Map" :
            for (var _i = 0, _a = Object.keys(_this.gamedata.data).filter(function (name) { return name.startsWith('Map') && name !== 'MapInfos'; }); _i < _a.length; _i++) {
                var fileName = _a[_i];
                // Format map from game file and and to world
                var _gameMap = _this.getMapFromGameData(_this.gamedata.data[fileName], fileName);
                var _isSummon = _gameMap.isSummonMap;
                var _isSync = _this.isMapInstanceable(_gameMap);
                console.log("[WORLD] ... ".concat(fileName, " ").concat(_isSummon ? '<Summon>' : '').concat(_this.isMapInstanceable(_gameMap) ? '<Sync>' : ''));
                _this.gameMaps.push(_gameMap);
                if (_isSync)
                    _this.instanceableMaps.push(_gameMap);
            }
        };
        this.getMapFromGameData = function (gameMap, fileName) {
            // a GameMap is a raw map file + some additional useful datas
            return Object.assign(gameMap, {
                mapId: _this.getMapIdByFileName(fileName),
                fileName: fileName,
                isSummonMap: _this.isSummonMap(gameMap),
                nodeType: 'map',
            });
        };
        this.getMapIdByFileName = function (fileName) { return Number(fileName.slice(3)); };
        this.makeInstance = function (map, initiator) {
            // Assign needed props to make Instance :
            var _map = Object.assign({}, map); // Keep original map clean
            var _time = new Date();
            return Object.assign(_map, {
                // an Instance is an extends of a GameMap
                uniqueId: "".concat(map.fileName, "#").concat(_this.instancedMaps.length, "@").concat(_time.getTime()),
                initiator: initiator || 'server',
                startedAt: _time,
                lastPlayerLeftAt: null,
                dieAfter: 60000,
                permanent: false,
                pauseAfter: 30000,
                paused: false,
                connectedNpcs: [],
                playersOnMap: [],
                actionsOnMap: [],
                allTiles: _this.provideMapTiles(map),
                nodeType: 'instance',
            });
        };
        this.runInstance = function (mapId, playerId) {
            var _map = _this.getMapById(mapId);
            if (_map && _this.isMapInstanceable(_map) && !_this.isMapInstanced(mapId)) {
                var _makeInstance = _this.makeInstance(_map, playerId);
                _this.instancedMaps.push(_makeInstance);
                _this.attachNode(_makeInstance);
                console.log('[WORLD] # Started instance', _makeInstance.uniqueId, {
                    // Output useful informations
                    uniqueId: _makeInstance.uniqueId,
                    initiator: _makeInstance.initiator,
                    startedAt: _makeInstance.startedAt,
                });
                _this.fetchConnectedNpcs(_map);
                _this.startInstanceLifecycle(mapId);
            }
        };
        this.killInstance = function (mapId) {
            if (_this.isMapInstanced(mapId) && !_this.getInstanceByMapId(mapId).playersOnMap.length) {
                // Clean instance if no more players on it
                for (var _i = 0, _a = _this.getAllNpcsByMapId(mapId); _i < _a.length; _i++) {
                    var _npc = _a[_i];
                    _this.removeConnectedNpcByUniqueId(_npc.uniqueId);
                }
                var index_1 = _this.instancedMaps.indexOf(_this.getInstanceByMapId(mapId));
                var _node = _this.getNodeBy('instanceUniqueId', _this.instancedMaps[index_1].uniqueId);
                var _cleanedInstance = {
                    // Keep useful datas
                    uniqueId: _this.instancedMaps[index_1].uniqueId,
                    initiator: _this.instancedMaps[index_1].initiator,
                    startedAt: _this.instancedMaps[index_1].startedAt,
                    lastPlayerLeftAt: _this.instancedMaps[index_1].lastPlayerLeftAt,
                    deletedAt: new Date(),
                    paused: true,
                };
                Object.keys(_this.instancedMaps[index_1]).map(function (key) { return delete _this.instancedMaps[index_1][key]; });
                Object.assign(_this.instancedMaps[index_1], _cleanedInstance); // Assign cleaned instance in state
                _this.removeNode(_node);
                console.log('[WORLD] # Killed instance', _cleanedInstance.uniqueId, _this.instancedMaps[index_1]);
            }
        };
        this.playerJoinInstance = function (playerId, mapId) {
            if (!_this.isMapInstanceable(_this.getMapById(mapId)) || _this.isSummonMap(_this.getMapById(mapId)))
                return;
            if (!_this.isMapInstanced(mapId))
                _this.runInstance(mapId, playerId); // If instance not existing, run it before
            if (_this.getInstanceByMapId(mapId).paused)
                _this.startInstanceLifecycle(mapId); // If paused, restart
            if (!_this.getInstanceByMapId(mapId)['playersOnMap'].includes(playerId)) {
                _this.getInstanceByMapId(mapId).playersOnMap.push(playerId); // Add playerId to Array
                console.log('[WORLD] playerJoinInstance', _this.getInstanceByMapId(mapId).uniqueId);
            }
        };
        this.playerLeaveInstance = function (playerId, mapId) {
            if (!_this.isMapInstanceable(_this.getMapById(mapId)))
                return;
            if (_this.getInstanceByMapId(mapId) && _this.getInstanceByMapId(mapId).playersOnMap.includes(playerId)) {
                var _players = _this.getInstanceByMapId(mapId).playersOnMap;
                // Remove playerId from Array
                _this.getInstanceByMapId(mapId).playersOnMap.splice(_players.indexOf(playerId), 1);
                console.log('[WORLD] playerLeaveInstance', mapId, JSON.stringify(_this.getInstanceByMapId(mapId).playersOnMap));
                if (!_this.getInstanceByMapId(mapId).playersOnMap.length)
                    _this.getInstanceByMapId(mapId).lastPlayerLeftAt = new Date();
                if (!_this.getInstanceByMapId(mapId).permanent) {
                    // Kill the instance after X ms
                    setTimeout(function () { return _this.killInstance(mapId); }, _this.getInstanceByMapId(mapId).dieAfter);
                }
            }
        };
        /*************************************************************************************** NPC Operations */
        this.fetchConnectedNpcs = function (map) {
            if (!map || !_this.isMapInstanced(map.mapId))
                return;
            for (var _i = 0, _a = _this.getInstanceByMapId(map.mapId).events.filter(function (event) {
                return JSON.stringify(event).includes('<Sync>');
            }); _i < _a.length; _i++) {
                var npc = _a[_i];
                var _generatedNpc = _this.makeConnectedNpc(npc, map);
                if (_generatedNpc && _this.isConnectableNpc(_generatedNpc)) {
                    _this.getConnectedNpcs(map.mapId).push(_generatedNpc);
                    _this.attachNode(_generatedNpc);
                    console.log('[WORLD] Added synced NPC ' + _generatedNpc.uniqueId + ' on map ' + map.mapId);
                }
            }
        };
        this.getAllNpcsByMapId = function (mapId) {
            if (!mapId || !_this.getMapById(mapId) || !_this.getInstanceByMapId(mapId))
                return;
            return []
                .concat(_this.getConnectedNpcs(mapId))
                .concat(
            // Concat multiple arrays into one :
            _this.getMapById(mapId).events) // add static events
                .filter(function (event) { return !!event; }); // remove null events
        };
        this.getAllPlayersByMapId = function (mapId) {
            if (!mapId)
                return;
            return _this.nodes.filter(function (node) { return !!node.playerId && node.mapId === mapId; });
        };
        this.getAllEntitiesByMapId = function (mapId) {
            if (!mapId)
                return;
            return [].concat(_this.getAllPlayersByMapId(mapId)).concat(_this.getAllNpcsByMapId(mapId));
        };
        this.isConnectableNpc = function (npc) {
            return JSON.stringify(npc).includes('<Sync>') && npc._moveType === 1;
        };
        this.makeConnectedNpc = function (npc, instance, pageIndex, initiator) {
            if (pageIndex === void 0) { pageIndex = null; }
            if (initiator === void 0) { initiator = 'server'; }
            if (!npc || !instance)
                return;
            // Target selected or first page to assign helpers :
            var formatedPageIndex = pageIndex && !isNaN(pageIndex) ? parseInt(pageIndex) : 0;
            var _instance = _this.getInstanceByMapId(instance.mapId);
            var _page = (npc.pages && npc.pages[formatedPageIndex]) || npc.pages[0];
            var _npc = Object.assign({}, npc); // Prevent rewrite existing when make
            return Object.assign(_npc, {
                // Add new properties
                uniqueId: "Npc".concat(npc.id, "#").concat(_instance.connectedNpcs.length, "@").concat(_instance.mapId),
                initiator: initiator || 'server',
                eventId: npc.id,
                absId: null,
                lastActionTime: new Date(),
                lastMoveTime: new Date(),
                summonable: false,
                busy: false,
                mapId: instance.mapId,
                nodeType: 'npc',
                // _ helpers
                _conditions: _page.conditions,
                _directionFix: _page.directionFix,
                _image: _page.image,
                _list: _page.list,
                _moveFrequency: _page.moveFrequency,
                _moveRoute: _page.moveRoute,
                _moveSpeed: _page.moveSpeed,
                _moveType: _page.moveType,
                _priorityType: _page.priorityType,
                _stepAnime: _page.stepAnime,
                _through: _page.through,
                _trigger: _page.trigger,
                _walkAnime: _page.walkAnime,
                _selectedPageIndex: formatedPageIndex,
            });
        };
        this.spawnNpc = function (npcSummonId, coords, pageIndex, initiator) {
            // coords = { mapId, x, y }
            if (!coords || !coords.mapId || !coords.x || !coords.y || !_this.getSummonMap())
                return;
            var _npcToReplicate = _this.getSummonMap().events.find(function (npc) { return npc && (npc.id === npcSummonId || (npc.summonId && npc.summonId === npcSummonId)); });
            var _targetInstance = _this.getInstanceByMapId(coords.mapId);
            if (!_npcToReplicate || !_targetInstance)
                return;
            var _generatedNpc = _this.makeConnectedNpc(_npcToReplicate, _targetInstance, pageIndex, initiator);
            if (!_generatedNpc)
                return;
            var uniqueIntegerId = 99999 + Math.floor(Math.random() * 99999); // Prevents event id conflicts
            Object.assign(_generatedNpc, {
                uniqueId: "Npc".concat(uniqueIntegerId, "#").concat(_this.getConnectedNpcs(coords.mapId).length, "@").concat(coords.mapId),
                summonId: npcSummonId,
                id: uniqueIntegerId,
                eventId: uniqueIntegerId,
                summonable: true,
                mapId: coords.mapId,
            });
            _this.attachNode(_generatedNpc);
            _this.spawnedUniqueIds.push(_generatedNpc.uniqueId);
            var _spawnedIndex = _this.spawnedUniqueIds.indexOf(_generatedNpc.uniqueId);
            _this.getConnectedNpcs(coords.mapId).push(_generatedNpc);
            _this.getNpcByUniqueId(_generatedNpc.uniqueId).x = coords.x || 1;
            _this.getNpcByUniqueId(_generatedNpc.uniqueId).y = coords.y || 1;
            security.createLog("[WORLD] Spawned NPC ".concat(_generatedNpc.uniqueId, " (").concat(coords.x, ";").concat(coords.y, ") by \"").concat(_generatedNpc.initiator, "\""));
            _this.socket.emitToAll('npcSpawn', _this.getNpcByUniqueId(_generatedNpc.uniqueId));
            return _spawnedIndex;
        };
        this.disableNpc = function (npc) {
            _this.npcMoveTo(npc, -1, -1); // visually hide npc
            Object.assign(_this.getNpcByUniqueId(npc.uniqueId), { busy: true }); // Prevent turn execution
        };
        this.removeSpawnedNpcByIndex = function (index) {
            if (!_this.spawnedUniqueIds[index])
                return;
            return _this.removeConnectedNpcByUniqueId(_this.spawnedUniqueIds[index]);
        };
        this.removeConnectedNpcByUniqueId = function (uniqueId) {
            if (!_this.getNpcByUniqueId(uniqueId) || !_this.getNpcInstance(uniqueId))
                return;
            var _parentInstance = _this.getNpcInstance(uniqueId);
            var _npc = _this.getNpcByUniqueId(uniqueId);
            var _node = _this.getNodeBy('npcUniqueId', _npc.uniqueId);
            var _spawnedIndex = _this.spawnedUniqueIds.indexOf(uniqueId);
            // Destroy NPC :
            _this.disableNpc(_npc); // Prevent tick to run this NPC
            _this.getConnectedNpcs(_parentInstance.mapId).splice(_this.getConnectedNpcs(_parentInstance.mapId).indexOf(_npc), 1);
            if (_spawnedIndex != -1)
                _this.spawnedUniqueIds.splice(_spawnedIndex, 1, ''); // replace item with empty str to keep spawned index
            _this.removeNode(_node);
            console.log("[WORLD] Removed NPC ".concat(uniqueId, " at ").concat(new Date()));
            _this.socket.emitToAll('npcRemove', { uniqueId: uniqueId });
            return uniqueId;
        };
        this.npcMoveStraight = function (npc, direction, animSkip) {
            if (animSkip === void 0) { animSkip = false; }
            if (!npc || !_this.getNpcByUniqueId(npc.uniqueId))
                return;
            // console.log('[WORLD] npcMoveStraight (1/2)', npc.uniqueId, { x: npc.x,y: npc.y }, {direction});
            if (_this.rpgmaker._canPass(npc, direction)) {
                var _map = _this.getNpcInstance(npc.uniqueId);
                _this.getNpcByUniqueId(npc.uniqueId).x = _this.rpgmaker._roundXWithDirection(_map.mapId, npc.x, direction);
                _this.getNpcByUniqueId(npc.uniqueId).y = _this.rpgmaker._roundYWithDirection(_map.mapId, npc.y, direction);
                _this.mutateNode(_this.getNodeBy('npcUniqueId', npc.uniqueId), {
                    x: _this.getNpcByUniqueId(npc.uniqueId).x,
                    y: _this.getNpcByUniqueId(npc.uniqueId).y,
                });
                _this.socket.emitToAll('npc_moving', {
                    uniqueId: npc.uniqueId,
                    mapId: _map.mapId,
                    id: npc.eventId,
                    moveSpeed: npc._moveSpeed,
                    moveFrequency: npc._moveFrequency,
                    direction: direction,
                    x: _this.getNpcByUniqueId(npc.uniqueId).x,
                    y: _this.getNpcByUniqueId(npc.uniqueId).y,
                    skip: animSkip,
                });
                /* console.log('[WORLD] npcMoveStraight (2/2)', npc.uniqueId, {
          x: world.getNpcByUniqueId(npc.uniqueId).x,
          y: world.getNpcByUniqueId(npc.uniqueId).y
        }); */
                return true;
            }
            else
                return false;
        };
        this.npcMoveTo = function (npc, x, y) {
            if (!npc || !x || !y || !_this.getNpcByUniqueId(npc.uniqueId))
                _this.getNpcByUniqueId(npc.uniqueId).x = x;
            _this.getNpcByUniqueId(npc.uniqueId).y = y;
            _this.mutateNode(_this.getNodeBy('npcUniqueId', npc.uniqueId), { x: x, y: y });
            _this.socket.emitToAll('npc_moving', {
                uniqueId: _this.getNpcByUniqueId(npc.uniqueId).uniqueId,
                mapId: _this.getNpcByUniqueId(npc.uniqueId).mapId,
                id: _this.getNpcByUniqueId(npc.uniqueId).eventId,
                x: _this.getNpcByUniqueId(npc.uniqueId).x,
                y: _this.getNpcByUniqueId(npc.uniqueId).y,
                skip: true,
            });
        };
        this.npcMoveRandom = function (npc) {
            var direction = 2 + Math.floor(Math.random() * 4) * 2;
            return _this.npcMoveStraight(npc, direction);
        };
        /*************************************************************************************** Instance Life Cycle Operations */
        this.handleInstanceAction = function (action, instance, currentTime) {
            // This function will interpret/mock a game script then emit
            // an event to replicate it on every concerned player
            if (!action || !instance || !currentTime)
                return;
            return;
        };
        this.setNpcBusyStatus = function (uniqueId, initiator) {
            if (!uniqueId || !_this.getNpcByUniqueId(uniqueId))
                return;
            _this.getNpcByUniqueId(uniqueId).busy = initiator || false;
        };
        this.toggleNpcBusyStatus = function (uniqueId, status) {
            if (!uniqueId)
                return;
            _this.setNpcBusyStatus(uniqueId, status || !_this.getNpcByUniqueId(uniqueId).busy);
        };
        this.handleNpcTurn = function (npc, _currentTime, _cooldown) {
            // This function will read basic NPC behavior and mock it on
            // server-side then replicate it on every concerned player
            if (!npc || npc.busy || !npc.uniqueId || !_this.getNpcByUniqueId(npc.uniqueId))
                return;
            var currentTime = _currentTime || new Date(), cooldown = _cooldown || Infinity;
            // read NPCs infos (speed, rate, etc, ...)
            // const delayedActionTime = currentTime.getTime() - npc.lastActionTime.getTime();
            var delayedMoveTime = currentTime.getTime() - npc.lastMoveTime.getTime();
            // make NPCs behavior
            var canMoveThisTurn = delayedMoveTime > cooldown;
            if (npc._moveType === 1 && canMoveThisTurn) {
                var didMove = _this.npcMoveRandom(_this.getNpcByUniqueId(npc.uniqueId));
                if (didMove) {
                    _this.getNpcByUniqueId(npc.uniqueId).lastMoveTime = new Date();
                    // console.log('[WORLD] handleNpcTurn', npc.uniqueId, world.getNpcByUniqueId(npc.uniqueId).lastMoveTime);
                }
            }
        };
        this.startInstanceLifecycle = function (mapId) {
            var interval = 1000 / 60; // Tick 1 action every RPG Maker Frame (60f = 1s)
            var tick = setInterval(function () {
                var currentTime = new Date(); // Use precise tick time
                if (!_this.getInstanceByMapId(mapId)) {
                    // If no instance, interrupt lifecycle
                    clearInterval(tick);
                    return;
                }
                _this.getInstanceByMapId(mapId).paused = false; // Flag as running
                _this.getConnectedNpcs(mapId).map(function (npc) {
                    // Animate NPCS :
                    var moveDuration = npc._moveSpeed < 5 ? 650 - npc._moveSpeed * 100 : 350 - npc._moveSpeed * 50;
                    var moveCooldown = npc._moveFrequency === 5
                        ? interval + moveDuration + 5000 - 1000 * npc._moveFrequency
                        : interval + moveDuration + 5000 - 1000 * npc._moveFrequency + Math.floor(Math.random() * 2250);
                    npc && _this.handleNpcTurn(npc, currentTime, moveCooldown);
                });
                if (!_this.getInstanceByMapId(mapId).playersOnMap.length) {
                    // If no players on map at tick :
                    setTimeout(function () {
                        if (!_this.getInstanceByMapId(mapId)) {
                            // If instance is not loaded anymore :
                            clearInterval(tick);
                            return;
                        }
                        else if (!_this.getInstanceByMapId(mapId).playersOnMap.length) {
                            // If instance alive && no more players in it
                            clearInterval(tick); // Will suspend instance (not kill)
                            _this.getInstanceByMapId(mapId).paused = true; // Flag paused
                        }
                    }, _this.getInstanceByMapId(mapId).pauseAfter);
                }
            }, interval);
        };
        /*************************************************************************************** DataProviders */
        this.provideMapTiles = function (map) {
            var grid = [
                [
                    // x: [ y, ]
                    [], // y: [A,B,C,R]
                ],
            ];
            var _data = map.data || [];
            var _width = map.width; // Limit the iteration in horizontal
            var _height = map.height; // Paginate the iteration in vertical (handle layers)
            var heightIndex = 0, widthIndex = 0;
            for (var dataIndex = 0; dataIndex < _data.length; dataIndex++) {
                // i = cell xy informations by layer
                if (!grid[widthIndex])
                    grid[widthIndex] = [[]]; // if no X yet
                if (!grid[widthIndex][heightIndex])
                    grid[widthIndex][heightIndex] = []; // if no Y yet
                grid[widthIndex][heightIndex] = [_data[dataIndex]].concat(grid[widthIndex][heightIndex]); // Add to tile layers
                if (widthIndex + 1 < _width) {
                    // if still on current line
                    widthIndex++; // next cell
                }
                else {
                    heightIndex++; // next line
                    widthIndex = 0; // first cell
                    // (if next): layer first row, (else): next row
                    if (heightIndex >= _height)
                        heightIndex = 0;
                }
            }
            return grid;
        };
        this.mapTileFinder = function (mapId, x, y) {
            // console.log('mapTileFinder', mapId, x, y);
            return _this.getInstanceByMapId(mapId).allTiles[x][y];
        };
        this.npcFinder = function (uniqueId) {
            // `Npc${uniqueIntegerId}#${world.getConnectedNpcs(coords.mapId).length}@${coords.mapId}`
            try {
                return {
                    eventId: parseInt(uniqueId.split('Npc')[1].split('#')[0]),
                    npcIndex: parseInt(uniqueId.split('#')[1].split('@')[0]),
                    mapId: parseInt(uniqueId.split('@')[1]),
                };
            }
            catch (_) {
                return { mapId: -1, npcIndex: -1, eventId: -1 };
            }
        };
    }
    GameWorld.prototype.initialize = function (mmoCore) {
        mmoCore = mmo_core_1.default.getInstance();
        this.socket = mmoCore.socket;
        this.gamedata = mmoCore.gamedata;
        this.rpgmaker = mmoCore.rpgmaker;
        console.log('######################################');
        console.log('[WORLD] GAME WORLD by Axel Fiolle');
        this.fetchTilesets(); // Load collision informations
        this.fetchMaps(); // Load gamedata maps
        console.log('[WORLD] GAME WORLD is ready !');
        console.log('######################################');
    };
    // Global helpers
    GameWorld.prototype.getNode = function (uniqueId) {
        return this.nodes.find(function (node) { return node.uniqueId === uniqueId; });
    };
    GameWorld.prototype.getNodeBy = function (name, prop) {
        return this.nodes.find(function (node) { return node[name] === prop; });
    };
    GameWorld.prototype.getMapById = function (mapId) {
        return this.gameMaps.find(function (map) { return map.mapId === mapId; });
    };
    GameWorld.prototype.getInstanceByMapId = function (mapId) {
        return this.instancedMaps.find(function (instance) { return instance.mapId === mapId; });
    };
    GameWorld.prototype.getSummonMap = function () {
        return this.gameMaps.find(function (map) { return map.isSummonMap; });
    };
    GameWorld.prototype.getInstanceByUniqueId = function (uniqueId) {
        return this.instancedMaps.find(function (instance) { return instance.uniqueId === uniqueId; });
    };
    // Testing functions
    GameWorld.prototype.isMapInstanced = function (mapId) {
        return this.instancedMaps.find(function (i) { return i.mapId === mapId; });
    };
    GameWorld.prototype.isSummonMap = function (map) {
        return map.note && map.note.toUpperCase().includes('<SUMMON>');
    };
    GameWorld.prototype.isMapInstanceable = function (map) {
        return map.note && map.note.toUpperCase().includes('<SYNC>');
    };
    // NPC helpers
    GameWorld.prototype.removeNpc = function (uniqueId) {
        this.getNpcByUniqueId(uniqueId) ? GameWorld.removeConnectedNpc(uniqueId) : null;
    };
    GameWorld.prototype.getNpcMapId = function (uniqueId) {
        return this.npcFinder(uniqueId).mapId;
    };
    GameWorld.prototype.getNpcIndex = function (uniqueId) {
        return this.npcFinder(uniqueId).npcIndex;
    };
    GameWorld.prototype.getNpcEventId = function (uniqueId) {
        return this.npcFinder(uniqueId).eventId;
    };
    GameWorld.prototype.getNpcInstance = function (uniqueId) {
        return this.getInstanceByMapId(this.getNpcMapId(uniqueId));
    };
    GameWorld.prototype.getNpcByUniqueId = function (uniqueId) {
        return (this.getNpcInstance(uniqueId) &&
            this.getNpcInstance(uniqueId).connectedNpcs.find(function (npc) { return npc && npc.uniqueId && npc.uniqueId === uniqueId; }));
    };
    GameWorld.prototype.getConnectedNpcs = function (mapId) {
        return this.getInstanceByMapId(mapId) && this.getInstanceByMapId(mapId).connectedNpcs;
    };
    GameWorld.prototype.fetchTilesets = function () {
        this.tileSets = this.gamedata.data['Tilesets'] || [];
        console.log('[WORLD] Loaded Tilesets');
    };
    /*************************************************************************************** Nodes Operations */
    GameWorld.prototype.attachNode = function (object, isPlayer) {
        if (isPlayer === void 0) { isPlayer = false; }
        var _node;
        if (isPlayer) {
            _node = this.makeNode({
                nodeType: 'player',
                playerId: object.id,
                x: object.x,
                y: object.y,
                mapId: object.mapId,
            });
        }
        else
            _node = this.makeNode(object);
        if (_node)
            return this.nodes.push(_node);
    };
    GameWorld.prototype.makeNode = function (object) {
        if (!object || !object.nodeType)
            return;
        if (!object.uniqueId && !object.playerId)
            return;
        var playerId = object.playerId || null;
        var objectUniqueId = object.uniqueId || null;
        var instanceUniqueId = object.nodeType === 'instance' ? objectUniqueId : null;
        var npcUniqueId = object.nodeType === 'npc' ? objectUniqueId : null;
        var actionUniqueId = object.nodeType === 'action' ? objectUniqueId : null;
        var assetUniqueId = object.nodeType === 'asset' ? objectUniqueId : null;
        var uniqueIntegerId = 99999 + Math.floor(Math.random() * 99999);
        var uniqueId = "#".concat(uniqueIntegerId, "T").concat(new Date().getTime());
        var _node = {
            uniqueId: uniqueId,
            type: object.nodeType,
            playerId: playerId,
            instanceUniqueId: instanceUniqueId,
            npcUniqueId: npcUniqueId,
            actionUniqueId: actionUniqueId,
            assetUniqueId: assetUniqueId,
        };
        if (!playerId) {
            Object.assign(_node, {
                initiator: object.initiator || 'server',
            });
        }
        if (playerId || npcUniqueId) {
            Object.assign(_node, {
                mapId: object.mapId || 1,
                x: object.x || 0,
                y: object.y || 0,
            });
        }
        var removeNull = function (obj) { return Object.fromEntries(Object.entries(obj).filter(function (_a) {
            var _ = _a[0], value = _a[1];
            return value != null;
        })); };
        return removeNull(_node);
    };
    GameWorld.removeConnectedNpc = function (uniqueId) {
        console.log('I do not exist!  Please implement me');
        return null;
    };
    return GameWorld;
}());
exports.default = GameWorld;
