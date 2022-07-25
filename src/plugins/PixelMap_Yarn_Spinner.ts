import YarnBound from 'yarn-bound';
import { PluginManager } from 'rmmz';
import MMO_Core from './MMO_Core';
import axios from 'axios';

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

export async function yarnSpinnerProcesser(prefix, dialogue, startAt) {
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
    });

    await processYarnDialog(runner);
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
        variableStorage.set('introduced', true);
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

async function processYarnDialog(runner: YarnBound) {
    const currentResult = runner.currentResult;
    console.log(runner);
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
                    // $gameMessage.newPage();
                }
                runner.advance();
                await processYarnDialog(runner);
            }
            break;
        case YarnBound.OptionsResult:
            const choices = []; // Because some choices may NOT be available, the index within the choices array does
            const choiceIndexMap = {}; // not always match the index in yarn.  Because of that, we store the position
            let arrayIndex = 0; // of each option in BOTH arrays within a dictionary, so we can reference them in
            let yarnIndex = 0; // the callback.
            for (const option of currentResult.options) {
                if (option.isAvailable) {
                    choices.push(option.text);
                    choiceIndexMap[arrayIndex] = yarnIndex;
                    arrayIndex = arrayIndex + 1;
                }
                yarnIndex = yarnIndex + 1;
            }

            $gameMessage.setChoices(choices, 0, 0);

            $gameMessage.setChoiceCallback(async (responseIndex) => {
                runner.advance(choiceIndexMap[responseIndex]);
                await processYarnDialog(runner);
            });
            break;
        case YarnBound.CommandResult:
            await commandHandler(currentResult);
            runner.advance();
            await processYarnDialog(runner);
    }
}

async function commandHandler(cmdResult: YarnBound.CommandResult) {
    const splitCmd = cmdResult.command.split(' ');
    const cmd = splitCmd[0];
    switch (cmd) {
        case 'set_background':
            if (splitCmd.length == 2) {
                $gameMessage.setBackground(parseInt(splitCmd[1]));
            } else {
                console.log('Invalid argument number passed into set_background!');
            }
            break;
        case 'fade_to_black_and_back':
            if (splitCmd.length == 2) {
                // @ts-ignore
                SceneManager._scene._active = false;
                $gameScreen.startFadeOut(30);
                await new Promise((r) => setTimeout(r, parseInt(splitCmd[1])));
                $gameScreen.startFadeIn(30);
                // @ts-ignore
                SceneManager._scene._active = true;
            } else {
                console.log('Invalid argument number passed into fade_to_black_and_back!');
            }
            break;
        case 'give_item':
            if (splitCmd.length == 3) {
                console.log(splitCmd);
                $gameParty.gainItem($dataItems[splitCmd[1]], parseInt(splitCmd[2]), false);
            } else {
                console.log('Invalid argument number passed into give_item!');
            }
            break;
        default:
            console.log('No support yet for command: ' + cmd);
    }
}

// Need to persist this to server
const SERVERSIDE_STORAGE = true;
let globalDialogVariableStorage;
if (SERVERSIDE_STORAGE) {
    axios
        .get('/user', {
            params: {
                ID: 12345,
            },
        })
        .then(function (response) {
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        })
        .then(function () {
            // always executed
        });
} else {
    globalDialogVariableStorage = new Map();
}

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
        if (key.startsWith('dynamic_')) {
            return getDynamicValue(key.replace('dynamic_', ''));
        }
        const retrievalKey = key.startsWith('global_') ? key : this.prefix + '_' + key;

        return this.storage.get(retrievalKey);
    }

    set(key, value) {
        const retrievalKey = key.startsWith('global_') ? key : this.prefix + '_' + key;
        this.storage.set(retrievalKey, value);
    }
}

function getDynamicValue(variableName) {
    switch (variableName) {
        case 'playerOwnsTile':
            console.log('Made it');
            return true;
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
