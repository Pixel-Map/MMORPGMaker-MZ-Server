"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = function (mmoCore) {
    var socket = mmoCore.socket;
    var io = socket.socketConnection;
    var COLOR_PARTY = '#41BFEF';
    var COLOR_WHISPER = '#9762DC';
    var COLOR_ERROR = '#ff0000';
    var COLOR_ACTION = '#ffff00';
    var COLOR_GLOBAL = '#009933';
    var COLOR_NORMAL = '#F8F8F8';
    socket.loadModules('messages', true, mmoCore).then(function () {
        console.log('[I] Sub modules of messages loaded.');
    });
    // ---------------------------------------
    // ---------- SOCKETS RECEIVER AND EMITTER
    // ---------------------------------------
    io.on('connect', function (client) {
        client.on('new_message', function (message) {
            if (client.playerData === undefined) {
                return;
            }
            if (message.indexOf('/') === 0) {
                return checkCommand(message.substr(1, message.length), client);
            }
            exports.sendToMap(client.lastMap, client.playerData.username, message, client.id);
        });
    });
    // ---------------------------------------
    // ---------- EXPOSED FUNCTIONS
    // ---------------------------------------
    exports.sendToMap = function (map, username, message, senderId) {
        var payload = {
            username: username,
            msg: message,
            color: COLOR_NORMAL,
        };
        if (senderId) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            payload.senderId = senderId;
        }
        io.in(map).emit('new_message', payload);
    };
    exports.sendToAll = function (username, message, messageType) {
        var color = COLOR_GLOBAL;
        if (messageType === 'error') {
            color = COLOR_ERROR;
        }
        io.emit('new_message', {
            username: username,
            msg: message,
            color: color,
        });
    };
    exports.sendToPlayer = function (player, username, message, messageType) {
        var color = COLOR_NORMAL;
        if (messageType === 'error') {
            color = COLOR_ERROR;
        }
        if (messageType === 'whisper') {
            color = COLOR_WHISPER;
        }
        if (messageType === 'action') {
            color = COLOR_ACTION;
        }
        player.emit('new_message', {
            username: username,
            msg: message,
            color: color,
        });
    };
    exports.sendToParty = function (partyName, username, message) {
        io.in(partyName).emit('new_message', {
            username: username,
            msg: message,
            color: COLOR_PARTY,
        });
    };
    // ---------------------------------------
    // ---------- PRIVATE FUNCTIONS
    // ---------------------------------------
    function checkCommand(command, player) {
        var args = command.split(' ');
        for (var existingCommand in socket.modules.messages.subs) {
            if (args[0].toLowerCase() !== existingCommand.toLowerCase()) {
                continue;
            }
            socket.modules.messages.subs[existingCommand].use(args, player);
        }
    }
};
