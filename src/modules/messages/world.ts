import MMO_Core from '../../core/mmo_core';

exports.initialize = function (mmoCore: MMO_Core) {
    const { socket, database } = mmoCore;
    exports.use = async function (args, player) {
        if (args.length <= 1) {
            return socket.modules.messages.sendToPlayer(player, 'System', 'Not enough arguments.', 'error');
        }

        let message = '';
        for (let i = 1; i < args.length; i++) {
            message = message + ' ' + args[i];
        }

        socket.modules.messages.sendToAll('(World) ' + player.playerData.username, message, 'global');
    };
};
