import MMO_Core from '../core/mmo_core';

exports.initialize = function (mmoCore: MMO_Core) {
    const { socket } = mmoCore;
    socket.loadModules('player', true, mmoCore).then(() => {
        console.log('[I] Sub modules of player loaded.');
    });
};
