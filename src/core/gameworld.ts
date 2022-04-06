import MMO_Core from './mmo_core';
import pino from 'pino';
import Logger = pino.Logger;

/*****************************
 GAME WORLD by Axel Fiolle

 - Will allow you to synchronize NPCs inter/actions through multiple clients

 i. A connected map must include "<Sync>" inside its note.
 i. A connected NPC must include "<Sync>" in a comment in any page.

 i. The Spawn map must have "<Summon>" inside its note
 i. There must be only one spawn map
 i. Command to summon : /addNpc [eventId*] [mapId] [x] [y]

 *****************************/

const security = require('./security');

export default class GameWorld {
    public nodes = []; // Nodes will track every connected entity
    public gameMaps = []; // Formated exploitable files from gamedata
    public instanceableMaps = []; // Formated maps to track players and npcs
    public instancedMaps = []; // Maps that are currently up and synced
    public tileSets = []; // Needed to test collisions
    public spawnedUniqueIds = []; // Helper to find spawned NPCs without uniqueId

    private socket;
    private gamedata;
    private rpgmaker;
    private logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    initialize(mmoCore: MMO_Core) {
        this.socket = mmoCore.socket;

        this.gamedata = mmoCore.gamedata;
        this.rpgmaker = mmoCore.rpgmaker;

        this.logger.info('######################################');
        this.logger.info('[WORLD] GAME WORLD by Axel Fiolle');
        this.fetchTilesets(); // Load collision informations
        this.fetchMaps(); // Load gamedata maps
        this.logger.info('[WORLD] GAME WORLD is ready !');
        this.logger.info('######################################');
    }

    // Global helpers
    getNode(uniqueId) {
        return this.nodes.find((node) => node.uniqueId === uniqueId);
    }

    getNodeBy(name, prop) {
        return this.nodes.find((node) => node[name] === prop);
    }

    getMapById(mapId) {
        return this.gameMaps.find((map) => map.mapId === mapId);
    }

    getInstanceByMapId(mapId) {
        return this.instancedMaps.find((instance) => instance.mapId === mapId);
    }

    getSummonMap() {
        return this.gameMaps.find((map) => map.isSummonMap);
    }

    getInstanceByUniqueId(uniqueId) {
        return this.instancedMaps.find((instance) => instance.uniqueId === uniqueId);
    }

    // Testing functions
    isMapInstanced(mapId) {
        return this.instancedMaps.find((i) => i.mapId === mapId);
    }

    isSummonMap(map) {
        return map.note && map.note.toUpperCase().includes('<SUMMON>');
    }

    isMapInstanceable(map) {
        return map.note && map.note.toUpperCase().includes('<SYNC>');
    }

    // NPC helpers
    removeNpc(uniqueId) {
        this.getNpcByUniqueId(uniqueId) ? this.removeConnectedNpc(uniqueId) : null;
    }

    getNpcMapId(uniqueId) {
        return this.npcFinder(uniqueId).mapId;
    }

    getNpcIndex(uniqueId) {
        return this.npcFinder(uniqueId).npcIndex;
    }

    getNpcEventId(uniqueId) {
        return this.npcFinder(uniqueId).eventId;
    }

    getNpcInstance(uniqueId) {
        return this.getInstanceByMapId(this.getNpcMapId(uniqueId));
    }

    getNpcByUniqueId(uniqueId) {
        return (
            this.getNpcInstance(uniqueId) &&
            this.getNpcInstance(uniqueId).connectedNpcs.find((npc) => npc && npc.uniqueId && npc.uniqueId === uniqueId)
        );
    }

    getConnectedNpcs(mapId) {
        return this.getInstanceByMapId(mapId) && this.getInstanceByMapId(mapId).connectedNpcs;
    }

    fetchTilesets() {
        this.tileSets = this.gamedata.data['Tilesets'] || [];
        this.logger.info('[WORLD] Loaded Tilesets');
    }

    /*************************************************************************************** Nodes Operations */

    attachNode(object, isPlayer = false) {
        let _node;
        if (isPlayer) {
            _node = this.makeNode({
                nodeType: 'player',
                playerId: object.id,
                x: object.x,
                y: object.y,
                mapId: object.mapId,
            });
        } else _node = this.makeNode(object);

        if (_node) return this.nodes.push(_node);
    }

    makeNode(object) {
        if (!object || !object.nodeType) return;
        if (!object.uniqueId && !object.playerId) return;
        const playerId = object.playerId || null;
        const objectUniqueId = object.uniqueId || null;
        const instanceUniqueId = object.nodeType === 'instance' ? objectUniqueId : null;
        const npcUniqueId = object.nodeType === 'npc' ? objectUniqueId : null;
        const actionUniqueId = object.nodeType === 'action' ? objectUniqueId : null;
        const assetUniqueId = object.nodeType === 'asset' ? objectUniqueId : null;
        const uniqueIntegerId = 99999 + Math.floor(Math.random() * 99999);
        const uniqueId = `#${uniqueIntegerId}T${new Date().getTime()}`;
        const _node = {
            uniqueId,
            type: object.nodeType,
            playerId,
            instanceUniqueId,
            npcUniqueId,
            actionUniqueId,
            assetUniqueId,
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
        const removeNull = (obj) => Object.fromEntries(Object.entries(obj).filter(([_, value]) => value != null));
        return removeNull(_node);
    }

    removeNode = (node) => {
        if (!node || !node.uniqueId) return;
        return this.nodes.splice(this.nodes.indexOf(this.getNode(node.uniqueId)), 1);
    };

    mutateNode = (node, props) => {
        if (!node || !node.uniqueId || !this.getNode(node.uniqueId)) return;
        for (const key of Object.keys(props)) {
            // Prevent assigning protected or not existing keys :
            const protectedKeys = [
                'uniqueId',
                'type',
                'playerId',
                'instanceUniqueId',
                'npcUniqueId',
                'actionUniqueId',
                'assetUniqueId',
            ];
            if (protectedKeys.includes(key) || !Object.keys(this.getNode(node.uniqueId)).find((k) => k === key)) {
                security.createLog(`Invalid Key "${key}" assignation on Node ${node.uniqueId}`, 'error');
                return;
            }
        }
        return Object.assign(this.getNode(node.uniqueId), props);
    };

    /*************************************************************************************** Maps Operations */

    fetchMaps = () => {
        this.logger.info('[WORLD] Loading world maps');
        this.gameMaps = [];
        // use the file name as key in the loop, keeping only filename starting with "Map" :
        for (const fileName of Object.keys(this.gamedata.data).filter(
            (name) => name.startsWith('Map') && name !== 'MapInfos',
        )) {
            // Format map from game file and and to world
            const _gameMap = this.getMapFromGameData(this.gamedata.data[fileName], fileName);
            const _isSummon = _gameMap.isSummonMap;
            const _isSync = this.isMapInstanceable(_gameMap);
            this.logger.info(
                `[WORLD] ... ${fileName} ${_isSummon ? '<Summon>' : ''}${
                    this.isMapInstanceable(_gameMap) ? '<Sync>' : ''
                }`,
            );
            this.gameMaps.push(_gameMap);
            if (_isSync) this.instanceableMaps.push(_gameMap);
        }
    };

    getMapFromGameData = (gameMap, fileName) => {
        // a GameMap is a raw map file + some additional useful datas
        return Object.assign(gameMap, {
            mapId: this.getMapIdByFileName(fileName),
            fileName,
            isSummonMap: this.isSummonMap(gameMap),
            nodeType: 'map',
        });
    };

    getMapIdByFileName = (fileName) => Number(fileName.slice(3));

    makeInstance = (map, initiator) => {
        // Assign needed props to make Instance :
        const _map = Object.assign({}, map); // Keep original map clean
        const _time = new Date();
        return Object.assign(_map, {
            // an Instance is an extends of a GameMap
            uniqueId: `${map.fileName}#${this.instancedMaps.length}@${_time.getTime()}`,
            initiator: initiator || 'server', // playerId || 'server'
            startedAt: _time,
            lastPlayerLeftAt: null, // Date
            dieAfter: 60000, // When no more players left, kill after X ms
            permanent: false, // Make the instance never die
            pauseAfter: 30000, // When no more player, interrupt lifecycle after X ms
            paused: false, // Can prevent lifecycle execution
            connectedNpcs: [], // Array of Objects
            playersOnMap: [], // Array of String
            actionsOnMap: [], // Array of Objects -> Actions currently running in instance
            allTiles: this.provideMapTiles(map), // Generate the map's tiles informations
            nodeType: 'instance',
        });
    };

    runInstance = (mapId, playerId) => {
        const _map = this.getMapById(mapId);
        if (_map && this.isMapInstanceable(_map) && !this.isMapInstanced(mapId)) {
            const _makeInstance = this.makeInstance(_map, playerId);
            this.instancedMaps.push(_makeInstance);
            this.attachNode(_makeInstance);
            this.logger.info('[WORLD] # Started instance', _makeInstance.uniqueId, {
                // Output useful informations
                uniqueId: _makeInstance.uniqueId,
                initiator: _makeInstance.initiator,
                startedAt: _makeInstance.startedAt,
            });
            this.fetchConnectedNpcs(_map);
            this.startInstanceLifecycle(mapId);
        }
    };

    killInstance = (mapId) => {
        if (this.isMapInstanced(mapId) && !this.getInstanceByMapId(mapId).playersOnMap.length) {
            // Clean instance if no more players on it
            for (const _npc of this.getAllNpcsByMapId(mapId)) this.removeConnectedNpcByUniqueId(_npc.uniqueId);
            const index = this.instancedMaps.indexOf(this.getInstanceByMapId(mapId));
            const _node = this.getNodeBy('instanceUniqueId', this.instancedMaps[index].uniqueId);
            const _cleanedInstance = {
                // Keep useful datas
                uniqueId: this.instancedMaps[index].uniqueId,
                initiator: this.instancedMaps[index].initiator,
                startedAt: this.instancedMaps[index].startedAt,
                lastPlayerLeftAt: this.instancedMaps[index].lastPlayerLeftAt,
                deletedAt: new Date(),
                paused: true,
            };
            Object.keys(this.instancedMaps[index]).map((key) => delete this.instancedMaps[index][key]);
            Object.assign(this.instancedMaps[index], _cleanedInstance); // Assign cleaned instance in state
            this.removeNode(_node);
            this.logger.info('[WORLD] # Killed instance', _cleanedInstance.uniqueId, this.instancedMaps[index]);
        }
    };

    playerJoinInstance = (playerId, mapId) => {
        if (!this.isMapInstanceable(this.getMapById(mapId)) || this.isSummonMap(this.getMapById(mapId))) return;
        if (!this.isMapInstanced(mapId)) this.runInstance(mapId, playerId); // If instance not existing, run it before
        if (this.getInstanceByMapId(mapId).paused) this.startInstanceLifecycle(mapId); // If paused, restart
        if (!this.getInstanceByMapId(mapId)['playersOnMap'].includes(playerId)) {
            this.getInstanceByMapId(mapId).playersOnMap.push(playerId); // Add playerId to Array
            this.logger.info('[WORLD] playerJoinInstance', this.getInstanceByMapId(mapId).uniqueId);
        }
    };

    playerLeaveInstance = (playerId, mapId) => {
        if (!this.isMapInstanceable(this.getMapById(mapId))) return;
        if (this.getInstanceByMapId(mapId) && this.getInstanceByMapId(mapId).playersOnMap.includes(playerId)) {
            const _players = this.getInstanceByMapId(mapId).playersOnMap;
            // Remove playerId from Array
            this.getInstanceByMapId(mapId).playersOnMap.splice(_players.indexOf(playerId), 1);
            this.logger.info(
                '[WORLD] playerLeaveInstance',
                mapId,
                JSON.stringify(this.getInstanceByMapId(mapId).playersOnMap),
            );
            if (!this.getInstanceByMapId(mapId).playersOnMap.length)
                this.getInstanceByMapId(mapId).lastPlayerLeftAt = new Date();
            if (!this.getInstanceByMapId(mapId).permanent) {
                // Kill the instance after X ms
                setTimeout(() => this.killInstance(mapId), this.getInstanceByMapId(mapId).dieAfter);
            }
        }
    };

    /*************************************************************************************** NPC Operations */

    fetchConnectedNpcs = (map) => {
        if (!map || !this.isMapInstanced(map.mapId)) return;
        for (const npc of this.getInstanceByMapId(map.mapId).events.filter((event) =>
            JSON.stringify(event).includes('<Sync>'),
        )) {
            const _generatedNpc = this.makeConnectedNpc(npc, map);
            if (_generatedNpc && this.isConnectableNpc(_generatedNpc)) {
                this.getConnectedNpcs(map.mapId).push(_generatedNpc);
                this.attachNode(_generatedNpc);
                this.logger.info('[WORLD] Added synced NPC ' + _generatedNpc.uniqueId + ' on map ' + map.mapId);
            }
        }
    };

    getAllNpcsByMapId = (mapId) => {
        if (!mapId || !this.getMapById(mapId) || !this.getInstanceByMapId(mapId)) return;
        return []
            .concat(this.getConnectedNpcs(mapId))
            .concat(
                // Concat multiple arrays into one :
                this.getMapById(mapId).events,
            ) // add static events
            .filter((event) => !!event); // remove null events
    };

    getAllPlayersByMapId = (mapId) => {
        if (!mapId) return;
        return this.nodes.filter((node) => !!node.playerId && node.mapId === mapId);
    };

    getAllEntitiesByMapId = (mapId) => {
        if (!mapId) return;
        return [].concat(this.getAllPlayersByMapId(mapId)).concat(this.getAllNpcsByMapId(mapId));
    };

    isConnectableNpc = (npc) => {
        return JSON.stringify(npc).includes('<Sync>') && npc._moveType === 1;
    };

    makeConnectedNpc = (npc, instance, pageIndex = null, initiator = 'server') => {
        if (!npc || !instance) return;
        // Target selected or first page to assign helpers :
        const formatedPageIndex = pageIndex && !isNaN(pageIndex) ? parseInt(pageIndex) : 0;
        const _instance = this.getInstanceByMapId(instance.mapId);
        const _page = (npc.pages && npc.pages[formatedPageIndex]) || npc.pages[0];
        const _npc = Object.assign({}, npc); // Prevent rewrite existing when make
        return Object.assign(_npc, {
            // Add new properties
            uniqueId: `Npc${npc.id}#${_instance.connectedNpcs.length}@${_instance.mapId}`, // Every NPC has to be clearly differentiable
            initiator: initiator || 'server',
            eventId: npc.id, // Event "ID" client-side
            absId: null, // Help to resolve ABS logic (if and when any)
            lastActionTime: new Date(),
            lastMoveTime: new Date(),
            summonable: false,
            busy: false, // { id: string | int, type: string, since: Date } | false
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

    spawnNpc = (npcSummonId, coords, pageIndex, initiator) => {
        // coords = { mapId, x, y }
        if (!coords || !coords.mapId || !coords.x || !coords.y || !this.getSummonMap()) return;

        const _npcToReplicate = this.getSummonMap().events.find(
            (npc) => npc && (npc.id === npcSummonId || (npc.summonId && npc.summonId === npcSummonId)),
        );
        const _targetInstance = this.getInstanceByMapId(coords.mapId);
        if (!_npcToReplicate || !_targetInstance) return;
        const _generatedNpc = this.makeConnectedNpc(_npcToReplicate, _targetInstance, pageIndex, initiator);
        if (!_generatedNpc) return;
        const uniqueIntegerId = 99999 + Math.floor(Math.random() * 99999); // Prevents event id conflicts
        Object.assign(_generatedNpc, {
            uniqueId: `Npc${uniqueIntegerId}#${this.getConnectedNpcs(coords.mapId).length}@${coords.mapId}`,
            summonId: npcSummonId,
            id: uniqueIntegerId,
            eventId: uniqueIntegerId,
            summonable: true,
            mapId: coords.mapId,
        });

        this.attachNode(_generatedNpc);
        this.spawnedUniqueIds.push(_generatedNpc.uniqueId);
        const _spawnedIndex = this.spawnedUniqueIds.indexOf(_generatedNpc.uniqueId);
        this.getConnectedNpcs(coords.mapId).push(_generatedNpc);

        this.getNpcByUniqueId(_generatedNpc.uniqueId).x = coords.x || 1;
        this.getNpcByUniqueId(_generatedNpc.uniqueId).y = coords.y || 1;

        security.createLog(
            `[WORLD] Spawned NPC ${_generatedNpc.uniqueId} (${coords.x};${coords.y}) by "${_generatedNpc.initiator}"`,
        );
        this.socket.emitToAll('npcSpawn', this.getNpcByUniqueId(_generatedNpc.uniqueId));

        return _spawnedIndex;
    };

    disableNpc = (npc) => {
        this.npcMoveTo(npc, -1, -1); // visually hide npc
        Object.assign(this.getNpcByUniqueId(npc.uniqueId), { busy: true }); // Prevent turn execution
    };

    removeSpawnedNpcByIndex = (index) => {
        if (!this.spawnedUniqueIds[index]) return;
        return this.removeConnectedNpcByUniqueId(this.spawnedUniqueIds[index]);
    };

    removeConnectedNpcByUniqueId = (uniqueId) => {
        if (!this.getNpcByUniqueId(uniqueId) || !this.getNpcInstance(uniqueId)) return;
        const _parentInstance = this.getNpcInstance(uniqueId);
        const _npc = this.getNpcByUniqueId(uniqueId);
        const _node = this.getNodeBy('npcUniqueId', _npc.uniqueId);
        const _spawnedIndex = this.spawnedUniqueIds.indexOf(uniqueId);

        // Destroy NPC :
        this.disableNpc(_npc); // Prevent tick to run this NPC
        this.getConnectedNpcs(_parentInstance.mapId).splice(
            this.getConnectedNpcs(_parentInstance.mapId).indexOf(_npc),
            1,
        );
        if (_spawnedIndex != -1) this.spawnedUniqueIds.splice(_spawnedIndex, 1, ''); // replace item with empty str to keep spawned index
        this.removeNode(_node);

        this.logger.debug(`[WORLD] Removed NPC ${uniqueId} at ${new Date()}`);
        this.socket.emitToAll('npcRemove', { uniqueId });
        return uniqueId;
    };

    npcMoveStraight = (npc, direction, animSkip = false) => {
        if (!npc || !this.getNpcByUniqueId(npc.uniqueId)) return;
        this.logger.trace('[WORLD] npcMoveStraight (1/2)', npc.uniqueId, { x: npc.x, y: npc.y }, { direction });
        if (this.rpgmaker._canPass(npc, direction)) {
            const _map = this.getNpcInstance(npc.uniqueId);
            this.getNpcByUniqueId(npc.uniqueId).x = this.rpgmaker._roundXWithDirection(_map.mapId, npc.x, direction);
            this.getNpcByUniqueId(npc.uniqueId).y = this.rpgmaker._roundYWithDirection(_map.mapId, npc.y, direction);
            this.mutateNode(this.getNodeBy('npcUniqueId', npc.uniqueId), {
                x: this.getNpcByUniqueId(npc.uniqueId).x,
                y: this.getNpcByUniqueId(npc.uniqueId).y,
            });
            this.socket.emitToAll('npc_moving', {
                uniqueId: npc.uniqueId,
                mapId: _map.mapId,
                id: npc.eventId,
                moveSpeed: npc._moveSpeed,
                moveFrequency: npc._moveFrequency,
                direction: direction,
                x: this.getNpcByUniqueId(npc.uniqueId).x,
                y: this.getNpcByUniqueId(npc.uniqueId).y,
                skip: animSkip,
            });
            this.logger.trace('[WORLD] npcMoveStraight (2/2)', npc.uniqueId, {
                x: this.getNpcByUniqueId(npc.uniqueId).x,
                y: this.getNpcByUniqueId(npc.uniqueId).y,
            });
            return true;
        } else return false;
    };

    npcMoveTo = (npc, x, y) => {
        if (!npc || !x || !y || !this.getNpcByUniqueId(npc.uniqueId)) this.getNpcByUniqueId(npc.uniqueId).x = x;
        this.getNpcByUniqueId(npc.uniqueId).y = y;
        this.mutateNode(this.getNodeBy('npcUniqueId', npc.uniqueId), { x, y });
        this.socket.emitToAll('npc_moving', {
            uniqueId: this.getNpcByUniqueId(npc.uniqueId).uniqueId,
            mapId: this.getNpcByUniqueId(npc.uniqueId).mapId,
            id: this.getNpcByUniqueId(npc.uniqueId).eventId,
            x: this.getNpcByUniqueId(npc.uniqueId).x,
            y: this.getNpcByUniqueId(npc.uniqueId).y,
            skip: true,
        });
    };

    npcMoveRandom = (npc) => {
        const direction = 2 + Math.floor(Math.random() * 4) * 2;
        return this.npcMoveStraight(npc, direction);
    };

    /*************************************************************************************** Instance Life Cycle Operations */

    handleInstanceAction = (action, instance, currentTime) => {
        // This function will interpret/mock a game script then emit
        // an event to replicate it on every concerned player
        if (!action || !instance || !currentTime) return;
        return;
    };

    setNpcBusyStatus = (uniqueId, initiator) => {
        if (!uniqueId || !this.getNpcByUniqueId(uniqueId)) return;
        this.getNpcByUniqueId(uniqueId).busy = initiator || false;
    };

    toggleNpcBusyStatus = (uniqueId, status) => {
        if (!uniqueId) return;
        this.setNpcBusyStatus(uniqueId, status || !this.getNpcByUniqueId(uniqueId).busy);
    };

    handleNpcTurn = (npc, _currentTime, _cooldown) => {
        // This function will read basic NPC behavior and mock it on
        // server-side then replicate it on every concerned player
        if (!npc || npc.busy || !npc.uniqueId || !this.getNpcByUniqueId(npc.uniqueId)) return;

        const currentTime = _currentTime || new Date(),
            cooldown = _cooldown || Infinity;

        // read NPCs infos (speed, rate, etc, ...)
        // const delayedActionTime = currentTime.getTime() - npc.lastActionTime.getTime();
        const delayedMoveTime = currentTime.getTime() - npc.lastMoveTime.getTime();

        // make NPCs behavior
        const canMoveThisTurn = delayedMoveTime > cooldown;

        if (npc._moveType === 1 && canMoveThisTurn) {
            const didMove = this.npcMoveRandom(this.getNpcByUniqueId(npc.uniqueId));
            if (didMove) {
                this.getNpcByUniqueId(npc.uniqueId).lastMoveTime = new Date();
                this.logger.trace(
                    '[WORLD] handleNpcTurn',
                    npc.uniqueId,
                    this.getNpcByUniqueId(npc.uniqueId).lastMoveTime,
                );
            }
        }
    };

    startInstanceLifecycle = (mapId) => {
        const interval = 1000 / 60; // Tick 1 action every RPG Maker Frame (60f = 1s)
        const tick = setInterval(() => {
            const currentTime = new Date(); // Use precise tick time

            if (!this.getInstanceByMapId(mapId)) {
                // If no instance, interrupt lifecycle
                clearInterval(tick);
                return;
            }

            this.getInstanceByMapId(mapId).paused = false; // Flag as running
            this.getConnectedNpcs(mapId).map((npc) => {
                // Animate NPCS :
                const moveDuration = npc._moveSpeed < 5 ? 650 - npc._moveSpeed * 100 : 350 - npc._moveSpeed * 50;
                const moveCooldown =
                    npc._moveFrequency === 5
                        ? interval + moveDuration + 5000 - 1000 * npc._moveFrequency
                        : interval + moveDuration + 5000 - 1000 * npc._moveFrequency + Math.floor(Math.random() * 2250);
                npc && this.handleNpcTurn(npc, currentTime, moveCooldown);
            });

            if (!this.getInstanceByMapId(mapId).playersOnMap.length) {
                // If no players on map at tick :
                setTimeout(() => {
                    if (!this.getInstanceByMapId(mapId)) {
                        // If instance is not loaded anymore :
                        clearInterval(tick);
                        return;
                    } else if (!this.getInstanceByMapId(mapId).playersOnMap.length) {
                        // If instance alive && no more players in it
                        clearInterval(tick); // Will suspend instance (not kill)
                        this.getInstanceByMapId(mapId).paused = true; // Flag paused
                    }
                }, this.getInstanceByMapId(mapId).pauseAfter);
            }
        }, interval);
    };

    /*************************************************************************************** DataProviders */

    provideMapTiles = (map) => {
        const grid = [
            [
                // x: [ y, ]
                [], // y: [A,B,C,R]
            ],
        ];
        const _data = map.data || [];
        const _width = map.width; // Limit the iteration in horizontal
        const _height = map.height; // Paginate the iteration in vertical (handle layers)
        let heightIndex = 0,
            widthIndex = 0;

        for (let dataIndex = 0; dataIndex < _data.length; dataIndex++) {
            // i = cell xy informations by layer
            if (!grid[widthIndex]) grid[widthIndex] = [[]]; // if no X yet
            if (!grid[widthIndex][heightIndex]) grid[widthIndex][heightIndex] = []; // if no Y yet
            grid[widthIndex][heightIndex] = [_data[dataIndex]].concat(grid[widthIndex][heightIndex]); // Add to tile layers

            if (widthIndex + 1 < _width) {
                // if still on current line
                widthIndex++; // next cell
            } else {
                heightIndex++; // next line
                widthIndex = 0; // first cell
                // (if next): layer first row, (else): next row
                if (heightIndex >= _height) heightIndex = 0;
            }
        }
        return grid;
    };

    mapTileFinder = (mapId, x, y) => {
        this.logger.trace('mapTileFinder', mapId, x, y);
        return this.getInstanceByMapId(mapId).allTiles[x][y];
    };

    npcFinder = (uniqueId) => {
        // `Npc${uniqueIntegerId}#${world.getConnectedNpcs(coords.mapId).length}@${coords.mapId}`
        try {
            return {
                eventId: parseInt(uniqueId.split('Npc')[1].split('#')[0]),
                npcIndex: parseInt(uniqueId.split('#')[1].split('@')[0]),
                mapId: parseInt(uniqueId.split('@')[1]),
            };
        } catch (_) {
            return { mapId: -1, npcIndex: -1, eventId: -1 };
        }
    };

    private removeConnectedNpc(uniqueId) {
        this.logger.warn('I do not exist!  Please implement me');
        return null;
    }
}
