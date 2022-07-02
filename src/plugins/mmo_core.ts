class Core {
    socket: any;
    Parameters: any;
    allowTouch: boolean;
    private _onTouchStart: any;

    constructor() {
        this.Parameters = PluginManager.parameters('MMO_Core');
        // @ts-ignore
        this.socket = io(String(this.Parameters['Server Location']));
        this.allowTouch = true;

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

        TouchInput._onTouchStart = (event) => {
            if (!this.allowTouch) return;
            // @ts-ignore
            MMO_Core._onTouchStart.call(this, event);
        };

        this._onTouchStart = TouchInput._onTouchStart;
    }

    sendMessage(message) {
        if (message.length <= 0) return;
        this.socket.emit('new_message', message);
    }
}

export default new Core();
