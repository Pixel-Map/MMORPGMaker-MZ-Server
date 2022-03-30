"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = function (mmoCore) {
    var socket = mmoCore.socket;
    exports.use = function (args, initiator) {
        socket.modules.messages.sendToPlayer(initiator, 'System', '---- Available commands :', 'action');
        socket.modules.messages.sendToPlayer(initiator, 'System', '/changePassword [old] [new]', 'action');
        socket.modules.messages.sendToPlayer(initiator, 'System', '/findUser [username]', 'action');
        socket.modules.messages.sendToPlayer(initiator, 'System', '/givegold [username] [amount]', 'action');
        socket.modules.messages.sendToPlayer(initiator, 'System', '/joinparty [username]', 'action');
        socket.modules.messages.sendToPlayer(initiator, 'System', '/leaveparty', 'action');
        socket.modules.messages.sendToPlayer(initiator, 'System', '/pa [message]', 'action');
        socket.modules.messages.sendToPlayer(initiator, 'System', '/w [username] [message]', 'action');
        if (initiator.permission > 50) {
            socket.modules.messages.sendToPlayer(initiator, 'System', '/kick [username]', 'action');
            socket.modules.messages.sendToPlayer(initiator, 'System', '/npc add [eventId] [mapId] [x] [y]', 'action');
            socket.modules.messages.sendToPlayer(initiator, 'System', '/npc remove [index]', 'action');
            socket.modules.messages.sendToPlayer(initiator, 'System', '/nodes', 'action');
        }
    };
};
