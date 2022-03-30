import MMO_Core from '../../core/mmo_core';

exports.initialize = function (mmoCore: MMO_Core) {
    const { socket } = mmoCore;
    exports.use = async function (args, initiator) {
        if (initiator.isInParty === false) {
            return socket.modules.messages.sendToPlayer(initiator, 'System', 'You are not in a party.', 'error');
        }

        socket.modules.messages.sendToPlayer(initiator, 'System', 'You left the party!', 'action');
        socket.modules.player.subs.party.leaveParty(initiator);
    };

    // ---------------------------------------
    // ---------- NODEJS RECEIVER AND EMITTER
    // ---------------------------------------

    socket.serverEvent.on('player-left-party', (payload) => {
        socket.modules.messages.sendToParty(
            payload.partyName,
            'System',
            `${payload.player.playerData.username} left the party!`,
            'action',
        );
    });
};
