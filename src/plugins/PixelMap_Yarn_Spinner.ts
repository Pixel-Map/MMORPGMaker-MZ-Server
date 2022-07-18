import YarnBound from 'yarn-bound';
import { PluginManager } from 'rmmz';

const MAX_DIALOG_EXHAUSTION = 3;

PluginManager.registerCommand('PixelMap_Yarn_Spinner', 'yarn', (args) => {
    return fetch(args['Yarn File Path']).then((response) => {
        if (!response.ok) {
            throw new Error('HTTP error ' + response.status); // Rejects the promise
        }
        const prefix = args['Yarn File Path'].split('.')[0].replace('dialog/', '');
        const startAt = args['Start At'];
        response.text().then((dialogue) => yarnSpinnerProcesser(prefix, dialogue, startAt));
    });
});

export function yarnSpinnerProcesser(prefix, dialogue, startAt) {
    const variableStorage = new VariableStorage(prefix);

    // Stardew Mode is heavily opinionated, and based on https://stardewvalleywiki.com/Modding:Dialogue
    if (startAt == 'StardewMode') {
        startAt = getStardewModeNode(variableStorage, dialogue);
    }

    const runner = new YarnBound({
        dialogue,
        startAt: startAt,
        functions: {
            random_range: (min, max) => {
                return Math.floor(Math.random() * (max - min + 1) + min);
            },
        },
        variableStorage: variableStorage,
        handleCommand: commandHandler,
    });

    processYarnDialog(runner);
}

function getStardewModeNode(variableStorage: VariableStorage, dialogue) {
    // Process Exhaustion
    let exhaustion: number = variableStorage.getExhaustion();
    if (!exhaustion) {
        exhaustion = 0;
    }
    if (variableStorage.getExhaustion() >= MAX_DIALOG_EXHAUSTION) {
        return getRandomNodeOfType('Exhausted', dialogue);
    }
    variableStorage.set('dialog_exhaustion', exhaustion + 1);

    // Have we already met the character?
    if (!variableStorage.get('introduced')) {
        return 'Start';
    }

    // If nothing else matches, grab one of the Anytime nodes
    return getRandomNodeOfType('Anytime', dialogue);
}

function getRandomNodeOfType(type, dialogue) {
    // Create Temporary Runner for lookups
    const tempRunner = new YarnBound({
        dialogue,
    });
    const nodes = Object.entries(tempRunner.runner.yarnNodes);

    const filtered = nodes.filter((node) => {
        return node[0].includes(type);
    });
    return filtered[Math.floor(Math.random() * filtered.length)][0];
}

function processYarnDialog(runner: YarnBound) {
    const currentResult = runner.currentResult;
    switch (currentResult.constructor) {
        case YarnBound.TextResult:
            console.log(currentResult);
            // Set the portrait to the name speaking
            const character = currentResult.markup.find((markup) => {
                return markup.name === 'character';
            });
            if (character) {
                $gameMessage.setFaceImage(character.properties.name, 0);
            }

            // var charName = $gameActors.actor(1).name();
            if (currentResult.text.trim().length > 0) {
                let text = currentResult.text;

                // Add Special Color
                const special = currentResult.markup.find((markup) => {
                    return markup.name === 'special';
                });
                if (special) {
                    text =
                        currentResult.text.slice(0, special.position) +
                        '\\C[1]' +
                        currentResult.text.slice(special.position, special.position + special.length) +
                        '\\C[0]' +
                        currentResult.text.slice(special.position + special.length);
                }

                $gameMessage.add(wrap(text, { width: 58 }));
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
        return this.storage.get(this.prefix + '_dialog_exhaustion') as number;
    }

    get(key) {
        const retrievalKey = key.startsWith('global_') ? key : this.prefix + '_' + key;

        return this.storage.get(retrievalKey);
    }

    set(key, value) {
        const retrievalKey = key.startsWith('global_') ? key : this.prefix + '_' + key;
        this.storage.set(retrievalKey, value);
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

// Word Wrapper
function wrap(str, options) {
    options = options || {};
    if (str == null) {
        return str;
    }

    const width = options.width || 50;
    const indent = typeof options.indent === 'string' ? options.indent : '';

    const newline = options.newline || '\n' + indent;
    const escape = typeof options.escape === 'function' ? options.escape : identity;

    let regexString = '.{1,' + width + '}';
    if (options.cut !== true) {
        regexString += '([\\s\u200B]+|$)|[^\\s\u200B]+?([\\s\u200B]+|$)';
    }

    const re = new RegExp(regexString, 'g');
    const lines = str.match(re) || [];
    let result =
        indent +
        lines
            .map(function (line) {
                if (line.slice(-1) === '\n') {
                    line = line.slice(0, line.length - 1);
                }
                return escape(line);
            })
            .join(newline);

    if (options.trim === true) {
        result = result.replace(/[ \t]*$/gm, '');
    }
    return result;
}

function identity(str) {
    return str;
}
