exports.initialize = function () {
    const socket = require('../../core/socket');
    exports.use = async function (args, initiator) {
        const players = await socket.modules.player.subs.player.getPlayers();

        if (args.length === 1) {
            return socket.modules.messages.sendToPlayer(
                initiator,
                'System',
                `There is ${Object.keys(players).length} person(s) online now!`,
                'action',
            );
        }

        const targetsName = args[1].toLowerCase();
        if (players[targetsName] === undefined) {
            return socket.modules.messages.sendToPlayer(initiator, 'System', 'Could not find the user.', 'error');
        }

        return socket.modules.messages.sendToPlayer(
            initiator,
            'System',
            `${players[targetsName].playerData.username} is level ${players[targetsName].playerData.stats.level}!`,
            'action',
        );
    };
};
