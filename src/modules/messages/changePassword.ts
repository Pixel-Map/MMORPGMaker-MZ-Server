import MMO_Core from '../../core/mmo_core';

exports.initialize = function (mmoCore: MMO_Core) {
    const { socket, database } = mmoCore;
    const security = require('../../core/security');

    exports.use = async function (args, initiator) {
        if (args.length < 3) {
            return socket.modules.messages.sendToPlayer(initiator, 'System', 'Not enough arguments.', 'error');
        }

        const oldPassword = security.hashPassword(args[1].toLowerCase());
        const newPassword = security.hashPassword(args[2].toLowerCase());

        const user = await database.findUser({ username: initiator.playerData.username });
        if (user) {
            if (oldPassword !== user.password) {
                return socket.modules.messages.sendToPlayer(initiator, 'System', 'Wrong old password.', 'error');
            }

            const payload = {
                username: initiator.playerData.username,
                password: newPassword,
            };

            await database.savePlayer(payload);
            socket.modules.messages.sendToPlayer(initiator, 'System', 'Password changed with success!', 'action');
        }
    };
};
