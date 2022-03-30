"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = function (mmoCore) {
    var socket = mmoCore.socket;
    socket.loadModules('player', true, mmoCore).then(function () {
        console.log('[I] Sub modules of player loaded.');
    });
};
