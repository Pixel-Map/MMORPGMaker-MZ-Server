import { io } from 'socket.io-client';

class Core {
    serverHost: string;
    socket: any;
    Parameters: any;
    allowTouch: boolean;
    _onTouchStart: any;

    constructor() {
        this.Parameters = PluginManager.parameters('MMO_Core');
        this.serverHost = String(this.Parameters['Server Location']);
        this.socket = io(this.serverHost);
        this.allowTouch = true;
        this._onTouchStart = TouchInput._onTouchStart;

        // Wildcard for any disconnection from the server.
        this.socket.on('disconnect', (reason) => {
            document.dispatchEvent(new Event('mmorpg_core_lost_connection')); // Dispatch event for connection lost.
            this.socket.close();
            alert(reason);
        });

        // Clean up the menu
        Window_MenuCommand.prototype.makeCommandList = function () {
            this.addMainCommands();
            this.addOriginalCommands();
            this.addOptionsCommand();
        };
    }

    sendMessage(message) {
        if (message.length <= 0) {
            return;
        }
        this.socket.emit('new_message', message);
    }
}

const MMO_Core = new Core();

// Enable the ability to start via touch
TouchInput._onTouchStart = function (event) {
    if (!MMO_Core.allowTouch) {
        return;
    }
    MMO_Core._onTouchStart.call(this, event);
};

export default MMO_Core;
