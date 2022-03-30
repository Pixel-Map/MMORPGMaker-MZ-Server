import MMO_Core from '../../core/mmo_core';

exports.initialize = function (mmoCore: MMO_Core) {
    const { socket } = mmoCore;
    exports.use = async function (args, player) {
        if (args.length <= 2) {
            return socket.modules.messages.sendToPlayer(player, 'System', 'Not enough arguments.', 'error');
        }

        const players = await socket.modules.player.subs.player.getPlayers();
        const targetsName = args[1].toLowerCase();
        if (players[targetsName] === undefined) {
            return socket.modules.messages.sendToPlayer(player, 'System', 'Could not find the player.', 'error');
        }

        let message = '';
        for (let i = 2; i < args.length; i++) {
            message = message + ' ' + args[i];
        }

        socket.modules.messages.sendToPlayer(player, '(Whisp) ' + player.playerData.username, message, 'whisper');
        socket.modules.messages.sendToPlayer(
            players[targetsName],
            '(Whisp) ' + player.playerData.username,
            message,
            'whisper',
        );
    };
};
