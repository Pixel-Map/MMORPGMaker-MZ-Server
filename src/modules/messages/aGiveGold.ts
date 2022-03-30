import MMO_Core from '../../core/mmo_core';

exports.initialize = function (mmoCore: MMO_Core) {
    const { socket, database } = mmoCore;

    exports.use = async function (args, initiator) {
        if (args.length <= 2) {
            return socket.modules.messages.sendToPlayer(initiator, 'System', 'Not enough arguments.', 'error');
        }
        if (initiator.playerData.permission < 100) {
            return socket.modules.messages.sendToPlayer(
                initiator,
                'System',
                "You don't have the permission to use this command.",
                'error',
            );
        }

        const players = await socket.modules.player.subs.player.getPlayers();
        const targetsName = args[1].toLowerCase();

        if (players[targetsName] === undefined) {
            return socket.modules.messages.sendToPlayer(initiator, 'System', 'Could not find the player.', 'error');
        }
        if (isNaN(args[2])) {
            return socket.modules.messages.sendToPlayer(initiator, 'System', 'Amount is not valid.', 'error');
        }
        if (args[2] > 1000000) {
            return socket.modules.messages.sendToPlayer(initiator, 'System', 'Amount is above 1,000,000.', 'error');
        }

        socket.modules.messages.sendToPlayer(
            initiator,
            'System',
            `You gave ${args[2]} gold to ${players[targetsName].playerData.username}!`,
            'action',
        );
        players[targetsName].playerData.stats.gold += parseInt(args[2]);

        // We save the new datas
        database.savePlayer(
            {
                username: players[targetsName].playerData.username,
                stats: players[targetsName].playerData.stats,
            },
            (e) => {
                socket.modules.player.subs.player.refreshData(players[targetsName]);
                socket.modules.messages.sendToPlayer(
                    players[targetsName],
                    'System',
                    `${initiator.playerData.username} gave you ${args[2]} gold!`,
                    'action',
                );
            },
        );
    };
};
