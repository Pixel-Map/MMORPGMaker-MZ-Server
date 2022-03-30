import MMO_Core from '../../core/mmo_core';

exports.initialize = function (mmoCore: MMO_Core) {
    const { socket } = mmoCore;
    exports.use = async function (args, initiator) {
        if (args.length <= 1) {
            return socket.modules.messages.sendToPlayer(initiator, 'System', 'Not enough arguments.', 'error');
        }
        const targetsName = args[1].toLowerCase();
        if (targetsName === initiator.playerData.username.toLowerCase()) {
            return socket.modules.messages.sendToPlayer(initiator, 'System', "You can't join your own party.", 'error');
        }
        if (initiator.isInParty) {
            return socket.modules.messages.sendToPlayer(initiator, 'System', 'You are already in a party.', 'error');
        }

        const players = await socket.modules.player.subs.player.getPlayers();
        const target = players[targetsName];
        if (target === undefined) {
            return socket.modules.messages.sendToPlayer(initiator, 'System', 'Could not find the player.', 'error');
        }
        if (target.playerData.isBusy === 'combat') {
            return socket.modules.messages.sendToPlayer(
                initiator,
                'System',
                "You can't join a player in combat.",
                'error',
            );
        }

        // We check if the player we try to join is a party leader or not.
        if (target.isInParty) {
            const partyLeader = await socket.modules.player.subs.party.getPartyLeader(target.isInParty);
            if (partyLeader.id !== target.id) {
                return socket.modules.messages.sendToPlayer(
                    initiator,
                    'System',
                    'He is not the party leader.',
                    'error',
                );
            }
        }

        socket.modules.player.subs.party.joinParty(initiator, target);
    };

    // ---------------------------------------
    // ---------- NODEJS RECEIVER AND EMITTER
    // ---------------------------------------

    socket.serverEvent.on('player-joined-party', (payload) => {
        socket.modules.messages.sendToParty(
            payload.partyName,
            'System',
            `${payload.player.playerData.username} joined the party!`,
            'action',
        );
    });
};
