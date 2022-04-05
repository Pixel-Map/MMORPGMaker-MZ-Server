import MMO_Core from '../../core/mmo_core';
import { Messages } from './messages';

export class aGive {
    mmoCore: MMO_Core;
    messages: Messages;

    constructor(messages: Messages) {
        this.mmoCore = messages.mmoCore;
        this.messages = messages;
    }

    //  agive playerName[1] itemType[2] itemId/amount[3] amount[4]
    async use(args, initiator) {
        if (initiator.playerData.permission < 100) {
            return this.messages.sendToPlayer(
                initiator,
                'System',
                "You don't have the permission to use this command.",
                'error',
            );
        }

        const players = await this.mmoCore.socket.modules.player.getPlayers(false);
        const amount = parseInt(args[4] !== undefined ? args[4] : args[3]);
        const itemId = parseInt(args[3]);
        const targetsName = args[1].toLowerCase();

        if (players[targetsName] === undefined) {
            return this.messages.sendToPlayer(initiator, 'System', 'Could not find the player.', 'error');
        }
        if (isNaN(args[3])) {
            return this.messages.sendToPlayer(initiator, 'System', 'Value is not valid.', 'error');
        }
        if (args.length < 4) {
            return this.messages.sendToPlayer(initiator, 'System', 'Not enough arguments.', 'error');
        }

        if (args[2] === 'gold') {
            players[targetsName].playerData.stats.gold += amount;

            this.messages.sendToPlayer(
                players[targetsName],
                'System',
                `${initiator.playerData.username} gave you ${args[3]} gold!`,
                'action',
            );
            this.messages.sendToPlayer(
                initiator,
                'System',
                `You gave ${args[3]} gold to ${players[targetsName].playerData.username}!`,
                'action',
            );
        } else if (args[2] === 'skills') {
            if (itemId > 0) {
                if (players[targetsName].playerData.stats[args[2]].includes(itemId)) {
                    return this.messages.sendToPlayer(
                        initiator,
                        'System',
                        `${players[targetsName].playerData.username} already has this skill.`,
                        'action',
                    );
                } else {
                    players[targetsName].playerData.stats.skills.push(itemId);
                }

                this.messages.sendToPlayer(
                    players[targetsName],
                    'System',
                    `${initiator.playerData.username} gave you ${itemId} Skill!`,
                    'action',
                );
                this.messages.sendToPlayer(
                    initiator,
                    'System',
                    `You gave skill ${itemId} to ${players[targetsName].playerData.username}!`,
                    'action',
                );
            } else {
                players[targetsName].playerData.stats.skills = players[targetsName].playerData.stats.skills.filter(
                    (skill) => {
                        if (skill !== -itemId) {
                            return skill;
                        }
                    },
                );

                this.messages.sendToPlayer(
                    players[targetsName],
                    'System',
                    `${initiator.playerData.username} removed ${itemId} skill from you!`,
                    'action',
                );
                this.messages.sendToPlayer(
                    initiator,
                    'System',
                    `You removed skill ${itemId} from ${players[targetsName].playerData.username}!`,
                    'action',
                );
            }
        } else if (args[2] === 'levels') {
            players[targetsName].playerData.stats.level += amount;

            this.messages.sendToPlayer(
                players[targetsName],
                'System',
                `${initiator.playerData.username} gave you ${amount} levels!`,
                'action',
            );
            this.messages.sendToPlayer(
                initiator,
                'System',
                `You gave ${amount} levels to ${players[targetsName].playerData.username}!`,
                'action',
            );
        } else if (args[2] === 'permission') {
            if (initiator.playerData.permission < amount) {
                return this.messages.sendToPlayer(
                    initiator,
                    'System',
                    "You don't have the permission to give that amount of permission!",
                    'error',
                );
            }

            players[targetsName].playerData.permission = amount;

            this.messages.sendToPlayer(
                players[targetsName],
                'System',
                `${initiator.playerData.username} gave you ${amount} permission!`,
                'action',
            );
            this.messages.sendToPlayer(
                initiator,
                'System',
                `You gave ${amount} permission level to ${players[targetsName].playerData.username}!`,
                'action',
            );
        } else if (args[2] === 'exp') {
            players[targetsName].playerData.stats.exp[1] += amount;

            this.messages.sendToPlayer(
                players[targetsName],
                'System',
                `${initiator.playerData.username} gave you ${amount} exp!`,
                'action',
            );
            this.messages.sendToPlayer(
                initiator,
                'System',
                `You gave ${amount} exp to ${players[targetsName].playerData.username}!`,
                'action',
            );
        } else {
            if (args[2] !== 'weapons' && args[2] !== 'items' && args[2] !== 'armors') {
                return this.messages.sendToPlayer(initiator, 'System', 'Item type is not valid.', 'error');
            }
            if (isNaN(args[4])) {
                return this.messages.sendToPlayer(initiator, 'System', 'Value is not valid.', 'error');
            }

            if (players[targetsName].playerData.stats[args[2]][itemId]) {
                players[targetsName].playerData.stats[args[2]][itemId] += amount;
            } else {
                players[targetsName].playerData.stats[args[2]][itemId] = amount;
            }

            this.messages.sendToPlayer(
                initiator,
                'System',
                'username: ' + targetsName + ', ' + args[2] + 'ID: ' + args[3] + ', with amount: ' + args[4],
                'action',
            );
            this.messages.sendToPlayer(
                players[targetsName],
                'System',
                `${initiator.playerData.username} gave you ${args[3]} in the amount of ${args[4]}!`,
                'action',
            );
        }

        await this.mmoCore.database.savePlayer({
            username: players[targetsName].playerData.username,
            stats: players[targetsName].playerData.stats,
            permission: players[targetsName].playerData.permission,
        });
        await this.mmoCore.socket.modules.player.refreshData(players[targetsName]);
    }
}
