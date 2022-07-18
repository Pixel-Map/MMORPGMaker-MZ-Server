const pluginName = 'PixelMap_TileHouse';

PluginManager.registerCommand(pluginName, 'enter', (args) => {
    $gamePlayer.reserveTransfer(parseInt(args.id, 10) + 1000, 10, 10, $gamePlayer.direction(), 0);
});

PluginManager.registerCommand(pluginName, 'exit', (args) => {
    const params = PluginManager.parameters(pluginName);
    const currentDynamicId = $gameMap._mapId - 1000;
    for (const exitData of JSON.parse(params.ExitsList)) {
        const exit = JSON.parse(exitData);
        if (parseInt(exit.dynamicId, 10) === currentDynamicId) {
            $gamePlayer.reserveTransfer(
                parseInt(exit.mapId, 10),
                parseInt(exit.x, 10),
                parseInt(exit.y, 10),
                $gamePlayer.direction(),
                0,
            );
            return;
        }
    }
    console.log('Error, dynamic ID not defined in PixelMap_TileHouse plugin array!');
});
