import YarnBound from 'yarn-bound';

// Need to persist this to server
const globalDialogVariableStorage = new Map();

class VariableStorage {
    storage: Map<string, unknown>;
    prefix: string;

    constructor(prefix) {
        this.storage = globalDialogVariableStorage;
        this.prefix = prefix;
    }
    getExhaustion() {
        return this.storage.get(this.prefix + '_dialog_exhaustion');
    }
    get(key) {
        const retrievalKey = key.startsWith('global_') ? key : this.prefix + '_' + key;

        return this.storage.get(retrievalKey);
    }
    set(key, value) {
        console.log(this.storage);
        console.log(value);
        const retrievalKey = key.startsWith('global_') ? key : this.prefix + '_' + key;
        this.storage.set(retrievalKey, value);
        console.log(this.storage);
    }
}

PluginManager.registerCommand('PixelMap_Yarn_Spinner', 'yarn', (args) => {
    return fetch(args['Yarn File Path']).then((response) => {
        if (!response.ok) {
            throw new Error('HTTP error ' + response.status); // Rejects the promise
        }
        const prefix = args['Yarn File Path'].split('.')[0].replace('dialog/', '');

        response.text().then((dialogue) => {
            const runner = new YarnBound({
                dialogue,
                startAt: args['Start At'],
                functions: {
                    random_range: (min, max) => {
                        return Math.floor(Math.random() * (max - min + 1) + min);
                    },
                },
                variableStorage: new VariableStorage(prefix),
                handleCommand: commandHandler,
            });
            console.log('Moo');
            processYarnDialog(runner);
        });
    });
});

function commandHandler(cmdResult: YarnBound.CommandResult) {
    const splitCmd = cmdResult.command.split(' ');
    const cmd = splitCmd[0];

    switch (cmd) {
        case 'set_background':
            if (splitCmd.length == 2) {
                $gameMessage.setBackground(parseInt(splitCmd[1]));
            } else {
                console.log('Invalid argument number passed into set_background!');
            }
    }
}

function processYarnDialog(runner: YarnBound) {
    const dialogExhaustion = runner.runner.variables.getExhaustion();
    if (dialogExhaustion > 2) {
        runner.generator = runner.runner.run('Exhausted');
        runner.advance();
    }

    const currentResult = runner.currentResult;

    switch (currentResult.constructor) {
        case YarnBound.TextResult:
            // Set the portrait to the name speaking
            const character = currentResult.markup.find((markup) => {
                return markup.name === 'character';
            });
            if (character) {
                $gameMessage.setFaceImage(character.properties.name, 0);
            }

            // var charName = $gameActors.actor(1).name();
            if (currentResult.text.trim().length > 0) {
                $gameMessage.add(currentResult.text.trim());
            }
            if (!currentResult.isDialogueEnd) {
                if (currentResult.text.trim().length > 0) {
                    $gameMessage.newPage();
                }
                runner.advance();
                processYarnDialog(runner);
            }
            break;
        case YarnBound.OptionsResult:
            const choices = currentResult.options.map((options) => options.text);
            $gameMessage.setChoices(choices, 0, 0);

            $gameMessage.setChoiceCallback((responseIndex) => {
                runner.advance(responseIndex);
                processYarnDialog(runner);
            });
            $gameMap._interpreter.setWaitMode('message');
            break;
    }
}

// MonkeyPatch by Hudell, without this, it's impossible to call messages AFTER a choice callback
// https://forums.rpgmakerweb.com/index.php?threads/script-works-but-not-in-a-conditional-explanation-please.71461/
Window_ChoiceList.prototype.callOkHandler = function () {
    const callback = $gameMessage._choiceCallback;
    const index = this.index();

    this._messageWindow.terminateMessage();
    this.close();

    if (callback) {
        callback(index);
    }
};

Window_ChoiceList.prototype.callCancelHandler = function () {
    const callback = $gameMessage._choiceCallback;
    const index = $gameMessage.choiceCancelType();

    this._messageWindow.terminateMessage();
    this.close();

    if (callback) {
        callback(index);
    }
};
