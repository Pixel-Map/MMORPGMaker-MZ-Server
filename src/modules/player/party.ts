import MMO_Core from '../../core/mmo_core';

export class Party {
    mmoCore: MMO_Core;
    combat;
    io;

    constructor(mmoCore: MMO_Core) {
        this.combat = {};
        this.mmoCore = mmoCore;
        const { socket } = mmoCore;
        const io = socket.socketConnection;
        this.io = io;
        // ---------------------------------------
        // ---------- SOCKETS EVENTS
        // ---------------------------------------

        io.on('connect', (player) => {
            player.on('party_player_join_fight', async (gameTroop) => {
                if (!player.isInParty) {
                    return;
                }

                // If the party is already in combat
                if (this.combat[player.isInParty][player.playerData.mapId]) {
                    // If the member already exist we do nothinng
                    if (this.combat[player.isInParty][player.playerData.mapId].members[player.id]) {
                        // eslint-disable-next-line no-return-assign
                        return (this.combat[player.isInParty][player.playerData.mapId].state = gameTroop);
                    }

                    // We add/update the member of the combat
                    this.combat[player.isInParty][player.playerData.mapId].members[player.id] = player;
                    await this.refreshPartyData(player.isInParty);
                    player.emit(
                        'party_player_join_fight',
                        this.combat[player.isInParty][player.playerData.mapId].state,
                    );
                    return;
                }

                // If the party is starting the combat.
                this.combat[player.isInParty][player.playerData.mapId] = {
                    initiator: player,
                    state: gameTroop,
                    members: {},
                    actions: {},
                };

                this.combat[player.isInParty][player.playerData.mapId].members[player.id] = player;

                // We take all the party members
                const partyMembers = (await socket.modules.player.getPlayers(player.isInParty)) || {};

                // We iterate through to them to invoke them in the battle if on the same map
                for (const k in partyMembers) {
                    if (partyMembers[k].id === player.id) {
                        continue;
                    } // If member is the same than player, we do nothing.
                    if (partyMembers[k].playerData.mapId !== player.playerData.mapId) {
                        continue;
                    } // If member is not on the same map, we don't nothing.

                    // We send the join fight socket
                    partyMembers[k].emit(
                        'party_player_join_fight',
                        this.combat[player.isInParty][player.playerData.mapId].state,
                    );
                }

                await this.refreshPartyData(player.isInParty);
            });

            /*:
             * party_player_action_fight
             */
            player.on('party_player_action_fight', async (action) => {
                console.log('party_player_action_fight');
                if (
                    !player.isInParty ||
                    !this.combat[player.isInParty] ||
                    !this.combat[player.isInParty][player.playerData.mapId]
                ) {
                    return;
                }

                // We add the identifiable action to the variable
                action.id = player.id;
                this.combat[player.isInParty][player.playerData.mapId].actions[player.playerData.username] = action;

                const actionsLength = Object.keys(
                    this.combat[player.isInParty][player.playerData.mapId].actions,
                ).length;
                const membersLength = Object.keys(
                    this.combat[player.isInParty][player.playerData.mapId].members,
                ).length;

                // If all players have finished doing actions
                if (actionsLength === membersLength) {
                    const actions = this.combat[player.isInParty][player.playerData.mapId].actions;
                    this.combat[player.isInParty][player.playerData.mapId].initiator.emit(
                        'party_player_estimate_fight',
                        actions,
                    );

                    // We empty the variable actions for the next turn
                    this.combat[player.isInParty][player.playerData.mapId].actions = {};
                }
            });

            player.on('party_player_estimate_fight', (results) => {
                console.log('party_player_estimate_fight');
                for (const k in this.combat[player.isInParty][player.playerData.mapId].members) {
                    this.combat[player.isInParty][player.playerData.mapId].members[k].emit(
                        'party_player_action_fight',
                        results,
                    );
                }
            });

            player.on('party_player_end_fight', () => {
                console.log('party_player_end_fight');
                if (!player.isInParty) {
                }
                if (!this.combat[player.isInParty]) {
                    return;
                }
                if (!this.combat[player.isInParty][player.playerData.mapId]) {
                    return;
                }

                player.playerData.isInCombat = false;

                if (this.combat[player.isInParty][player.playerData.mapId].initiator.id === player.id) {
                    this.disbandFight(player.isInParty, player.playerData.mapId);
                }
            });

            player.on('player_update_stats', () => {
                this.refreshPartyData(player.isInParty);
            });

            // Automatically leave the party when disconnecting
            player.on('disconnect', () => {
                if (this.combat[player.isInParty]) {
                    const mapId = player.playerData.mapId;
                    if (this.combat[player.isInParty][mapId]) {
                        if (this.combat[player.isInParty][mapId].members[player.id]) {
                            delete this.combat[player.isInParty][mapId].members[player.id];
                        }
                        if (this.combat[player.isInParty][mapId].initiator.id === player.id) {
                            this.disbandFight(player.isInParty, mapId);
                        }
                    }
                }

                this.leaveParty(player);
            });
        });
    }

    // ---------------------------------------
    // ---------- EXPOSED FUNCTIONS
    // ---------------------------------------

    async getPartyLeader(partyName) {
        const hostId = partyName.split('party-')[1];
        return this.io.sockets.connected[hostId];
    }

    async joinParty(joiner, joinee) {
        // If the joiner is alreayd in a party, we do nothing
        if (joiner.isInParty) {
            return;
        }

        const maxMembers = this.mmoCore.gamedata.data.Actors.length - 1; // We take the maximum party in RPG Maker MV
        const partyName = `party-${joinee.id}`; // We prepare the party name
        const rawPartyMembers = (await this.mmoCore.socket.modules.player.getPlayers(partyName)) || {};

        // If the party is attempted to be created but the game settings don't allow it
        if (maxMembers === 1 || maxMembers < Object.keys(rawPartyMembers).length + 1) {
            return;
        }

        joiner.isInParty = partyName; // We put the joiner in the party
        joiner.join(partyName, () => {
            // We create the party if it was not an existant one before.
            if (!joinee.isInParty) {
                joinee.join(partyName, () => {
                    // We initialize the party if just created.
                    joinee.isInParty = partyName;
                    this.combat[partyName] = {};
                    this.refreshPartyData(partyName);
                });
            } else {
                this.refreshPartyData(partyName);
            }

            this.mmoCore.socket.serverEvent.emit('player-joined-party', {
                player: joiner,
                partyName: partyName,
            });
        });
    }

    async leaveParty(leaver) {
        if (!leaver.isInParty) {
            return;
        }

        const partyName = leaver.isInParty;
        const partyLeader = await this.getPartyLeader(leaver.isInParty);

        leaver.leave(partyName, () => {
            leaver.isInParty = false;
            leaver.isInCombat = false;
            leaver.emit('refresh_party_data', {});
            this.refreshPartyData(partyName);

            this.mmoCore.socket.serverEvent.emit('player-left-party', {
                player: leaver,
                partyName: partyName,
            });

            // If party lead is leaving
            if (partyLeader === undefined || leaver.id === partyLeader.id) {
                return this.disbandParty(partyName);
            }
        });
    }

    async disbandParty(partyName) {
        const partyMembers = await this.mmoCore.socket.getConnectedSockets(partyName);
        const partyLeader = await this.mmoCore.socket.modules.player.getPlayerById(partyName.split('party-')[1]);

        this.mmoCore.socket.serverEvent.emit('player-disbanded-party', {
            partyLeader: partyLeader,
            partyName: partyName,
        });

        delete this.combat[partyName]; // We delete all fights related to the party

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        for (const k in partyMembers) {
            partyMembers[k].isInParty = false;
            partyMembers[k].playerData.isInCombat = false;
            partyMembers[k].emit('refresh_party_data', {});

            await this.leaveParty(partyName);
        }
    }

    async refreshPartyData(partyName) {
        if (!partyName || this.io.sockets.adapter.rooms[partyName] === undefined) {
            return;
        }

        const rawPartyMembers = (await this.mmoCore.socket.modules.player.getPlayers(partyName)) || {};
        const partyMembers = {};

        for (const k in rawPartyMembers) {
            partyMembers[k] = rawPartyMembers[k].playerData;
            partyMembers[k].isInitiator = !!(
                this.combat[partyName][rawPartyMembers[k].playerData.mapId] &&
                this.combat[partyName][rawPartyMembers[k].playerData.mapId].initiator.id === rawPartyMembers[k].id
            );
            partyMembers[k].isInCombat = !!(
                this.combat[partyName][rawPartyMembers[k].playerData.mapId] &&
                this.combat[partyName][rawPartyMembers[k].playerData.mapId].members[rawPartyMembers[k].id]
            );
        }

        this.io.in(partyName).emit('refresh_party_data', partyMembers);
    }

    // ===============
    // Combat handling
    // ===============

    // Return if the party of the player is in combat
    async isInCombat(player) {
        if (!player.isInParty || !this.combat[player.isInParty][player.playerData.mapId]) {
            return false;
        }
        if (this.combat[player.isInParty][player.playerData.mapId].initiator.id === player.id) {
            return false;
        }

        return this.combat[player.isInParty][player.playerData.mapId];
    }

    joinFight(player) {
        if (this.combat[player.isInParty][player.playerData.mapId].members[player.id]) {
            return;
        }

        // We add the player to the fight
        this.combat[player.isInParty][player.playerData.mapId].members[player.id] = player;

        player.emit('party_player_join_fight', this.combat[player.isInParty][player.playerData.mapId].state);
    }

    async disbandFight(partyName, mapId) {
        if (!this.combat[partyName][mapId]) {
            return;
        }

        const party = this.combat[partyName][mapId];
        delete this.combat[partyName][mapId];

        const rawPartyMembers = (await this.mmoCore.socket.modules.player.getPlayers(partyName)) || {};

        for (const k in rawPartyMembers) {
            if (rawPartyMembers[k].playerData.mapId !== party.initiator.playerData.mapId) {
                continue;
            }

            rawPartyMembers[k].emit('party_player_disband_fight');
        }
    }

    // ---------------------------------------
    // ---------- PRIVATE FUNCTIONS
    // ---------------------------------------
}
