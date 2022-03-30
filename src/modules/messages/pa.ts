import MMO_Core from '../../core/mmo_core';

exports.initialize = function (mmoCore: MMO_Core) {
    const { socket } = mmoCore;
    exports.use = async function (args, player) {
        if (args.length <= 1) {
            return socket.modules.messages.sendToPlayer(player, 'System', 'Not enough arguments.', 'error');
        }
        if (player.isInParty === false) {
            return socket.modules.messages.sendToPlayer(player, 'System', 'You are not in a party.', 'error');
        }

        let message = '';
        const playerName = player.isInParty;

        for (let i = 1; i < args.length; i++) {
            message = message + ' ' + args[i];
        }

        socket.modules.messages.sendToParty(playerName, '(Party) ' + player.playerData.username, message);
    };
};
