function MMO_Core() {
    // Do Nothing
}

MMO_Core.Parameters = PluginManager.parameters('MMO_Core');

// @ts-ignore
MMO_Core.socket = io(String(MMO_Core.Parameters['Server Location']));
MMO_Core.allowTouch = true;

// Wildcard for any disconnection from the server.
MMO_Core.socket.on('disconnect', (reason) => {
    document.dispatchEvent(new Event('mmorpg_core_lost_connection')); // Dispatch event for connection lost.
    MMO_Core.socket.close();
    alert(reason);
});

// Clean up the menu
Window_MenuCommand.prototype.makeCommandList = function () {
    this.addMainCommands();
    this.addOriginalCommands();
    this.addOptionsCommand();
};
// @ts-ignore
MMO_Core._onTouchStart = TouchInput._onTouchStart;
TouchInput._onTouchStart = function (event) {
    if (!MMO_Core.allowTouch) return;
    // @ts-ignore
    MMO_Core._onTouchStart.call(this, event);
};

// ---------------------------------------
// ---------- Exposed Functions
// ---------------------------------------

// @ts-ignore
MMO_Core.sendMessage = function (message) {
    if (message.length <= 0) return;
    MMO_Core.socket.emit('new_message', message);
};

export default MMO_Core;
