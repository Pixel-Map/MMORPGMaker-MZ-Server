import YarnBound from 'yarn-bound';

// Need to persist this to server
const variableStorage = new Map;

PluginManager.registerCommand('PixelMap_Yarn_Spinner', "yarn", (args) => {
  return fetch(args['Yarn File Path']).then(response => {
    if (!response.ok) {
      throw new Error("HTTP error " + response.status); // Rejects the promise
    }
    (response.text().then(dialogue => {
      const runner = new YarnBound({
        dialogue,
        startAt: args['Start At'],
        variableStorage: variableStorage
      })
      processYarnDialog(runner)
    }))
  });
});

function processYarnDialog(runner: YarnBound) {
  const currentResult = runner.currentResult;
  console.log(currentResult)
  switch(currentResult.constructor) {
    case YarnBound.TextResult:
      // Set the portrait to the name speaking
      const character = currentResult.markup.find(markup => {
        return markup.name === "character"
      })
      if (character) {
        $gameMessage.setFaceImage(character.properties.name,0);
      }

      // var charName = $gameActors.actor(1).name();
      if (currentResult.text.trim().length > 0) {
        $gameMessage.add(currentResult.text.trim());
      }
      if (!currentResult.isDialogueEnd) {
        if (currentResult.text.trim().length > 0) {
          $gameMessage.newPage()
        }
        runner.advance()
        processYarnDialog(runner)
      }
      break;
    case YarnBound.OptionsResult:
      const choices = currentResult.options.map((options) => options.text);
      $gameMessage.setChoices(choices, 0, 0);

      $gameMessage.setChoiceCallback((responseIndex) => {
        runner.advance(responseIndex)
        processYarnDialog(runner)
      })
      $gameMap._interpreter.setWaitMode('message');
      break
    case YarnBound.CommandResult:
      runner.advance()
      processYarnDialog(runner)
      break
  }
}

// MonkeyPatch by Hudell, without this, it's impossible to call messages AFTER a choice callback
// More details: https://forums.rpgmakerweb.com/index.php?threads/script-works-but-not-in-a-conditional-explanation-please.71461/
Window_ChoiceList.prototype.callOkHandler = function() {
  var callback = $gameMessage._choiceCallback;
  var index = this.index();

  this._messageWindow.terminateMessage();
  this.close();

  if (callback) {
    callback(index);
  }
};

Window_ChoiceList.prototype.callCancelHandler = function() {
  var callback = $gameMessage._choiceCallback;
  var index = $gameMessage.choiceCancelType();

  this._messageWindow.terminateMessage();
  this.close();

  if (callback) {
    callback(index);
  }
};
