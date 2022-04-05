import MMO_Core from '../../core/mmo_core.js';

export class Banks {
    mmoCore: MMO_Core;

    constructor(mmoCore: MMO_Core) {
        this.mmoCore = mmoCore;
        const { socket, database } = mmoCore;
        const io = socket.socketConnection;

        // ---------------------------------------
        // ---------- SOCKETS EVENTS
        // ---------------------------------------

        io.on('connect', (player) => {
            // When a player open a bank
            player.on('bank_open', async (bankName) => {
                const bank = await this.getBank(bankName);
                // We make sure we send the correct info
                bank.content =
                    bank.type === 'global'
                        ? bank.content
                        : bank.content[player.playerData.username] || {
                              items: {},
                              weapons: {},
                              armors: {},
                              gold: 0,
                          };

                player.emit('bank_open', bank);
            });

            // When a player deposit something in the bank
            player.on('bank_deposit', async (details) => {
                const bank = await this.getBankById(details.bankId);
                const payload =
                    bank.type === 'global'
                        ? bank.content
                        : bank.content[player.playerData.username] || {
                              items: {},
                              weapons: {},
                              armors: {},
                              gold: 0,
                          };

                // If we are putting gold
                if (details.gold) {
                    if (player.playerData.stats.gold < details.gold) {
                        return;
                    } // Anti-cheat : The player try to put more money than what he has
                    if (player.playerData.stats.gold <= 0) {
                        return;
                    } // Anti-cheat : The player try to put more money than what he has

                    player.playerData.stats.gold -= details.gold;

                    await database.savePlayer({
                        username: player.playerData.username,
                        stats: player.playerData.stats,
                    });
                    await socket.modules.player.refreshData(player);
                    payload.gold += details.gold;
                    await this.saveBank(bank, payload, player);

                    // If we are putting an item
                } else {
                    if (!details.itemType) {
                        return;
                    }

                    if (
                        !player.playerData.stats[details.itemType][details.itemId] ||
                        player.playerData.stats[details.itemType][details.itemId] < details.amount
                    ) {
                        return;
                    } // If the player is trying to duplicate or forge request

                    // Taking care of the player
                    if (player.playerData.stats[details.itemType][details.itemId] - details.amount <= 0) {
                        delete player.playerData.stats[details.itemType][details.itemId];
                    } else {
                        player.playerData.stats[details.itemType][details.itemId] -= details.amount;
                    }

                    await database.savePlayer({
                        username: player.playerData.username,
                        stats: player.playerData.stats,
                    });
                    await socket.modules.player.refreshData(player);
                    // Taking care of the bank
                    if (payload[details.itemType][details.itemId]) {
                        payload[details.itemType][details.itemId] += details.amount;
                    } else {
                        payload[details.itemType][details.itemId] = details.amount;
                    }
                    await this.saveBank(bank, payload, player);
                }
            });

            // When a player withdraw from the bank
            player.on('bank_withdraw', async (details) => {
                const bank = await this.getBankById(details.bankId);
                const payload =
                    bank.type === 'global'
                        ? bank.content
                        : bank.content[player.playerData.username] || {
                              items: {},
                              weapons: {},
                              armors: {},
                              gold: 0,
                          };

                // If we are withdrawing gold
                if (details.gold) {
                    if (payload.gold < details.gold) {
                        return;
                    } // Anti-cheat : The player try to put more money than what he has
                    if (payload.gold <= 0) {
                        return;
                    } // Anti-cheat : The player try to put more money than what he has

                    player.playerData.stats.gold += details.gold;

                    await database.savePlayer({
                        username: player.playerData.username,
                        stats: player.playerData.stats,
                    });
                    await socket.modules.player.refreshData(player);
                    payload.gold -= details.gold;

                    await this.saveBank(bank, payload, player);

                    // If we are withdrawing an item
                } else {
                    if (!details.itemType) {
                        return;
                    }

                    if (
                        !payload[details.itemType][details.itemId] ||
                        payload[details.itemType][details.itemId] < details.amount
                    ) {
                        return;
                    } // If the player is trying to duplicate or forge request

                    // Taking care of the player
                    if (!player.playerData.stats[details.itemType][details.itemId]) {
                        player.playerData.stats[details.itemType][details.itemId] = details.amount;
                    } else {
                        player.playerData.stats[details.itemType][details.itemId] += details.amount;
                    }

                    await database.savePlayer({
                        username: player.playerData.username,
                        stats: player.playerData.stats,
                    });

                    await socket.modules.player.refreshData(player);

                    // Taking care of the bank
                    if (payload[details.itemType][details.itemId] - details.amount <= 0) {
                        payload[details.itemType][details.itemId] = 0;
                    } else {
                        payload[details.itemType][details.itemId] -= details.amount;
                    }

                    await this.saveBank(bank, payload, player);
                }
            });
        });
    }
    // ---------------------------------------
    // ---------- EXPOSED FUNCTIONS
    // ---------------------------------------

    async getBank(bankName) {
        // todo: Implement getBank properly
        // return new Promise((resolve) => {
        //     this.mmoCore.database.getBank(bankName, (bank) => {
        //         resolve(bank);
        //     });
        // });
        return {
            content: {},
            type: 'global',
        };
    }

    async getBankById(bankId) {
        // todo: Implement getBankById properly
        // return new Promise((resolve) => {
        //     this.mmoCore.database.getBankById(bankId, (bank) => {
        //         resolve(bank);
        //     });
        // });
        return {
            content: {},
            type: 'global',
        };
    }

    async saveBank(bank, payload, player) {
        if (bank.type === 'global') {
            bank.content = payload;
        } else {
            bank.content[player.playerData.username] = payload;
        }

        this.mmoCore.database.saveBank(bank, (e) => {
            bank.content = payload;

            if (bank.type === 'global') {
                this.mmoCore.socket.emitToAll('bank_refresh', bank);
            } else {
                player.emit('bank_refresh', bank);
            }
        });
    }

    // ---------------------------------------
    // ---------- PRIVATE FUNCTIONS
    // ---------------------------------------
}
