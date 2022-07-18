/*:
 * @target MZ
 * @author PixelMap
 * @plugindesc PixelMap Yarn Spinner
 * @help This plugin adds support for Yarn Spinner dialog.  All dialog should be located directly under the main game directory
 * within a folder named "dialog", all with an extension of ".yarn".
 * 
 * Variables by default are prefixed by the name of the dialog file, meaning that each has it's own namespace (so one NPC
 * can feel one way about a player vs. another NPC, without worrying about variable name conflicts).
 * 
 * However, if a variable is prefixed with the "$global_", it will be stored globally, accessible by ALL NPCs.
 * 
 * There's also some additional functionality built-in.  If you'd like to have a NPC become exhausted after a player
 * speaks with them too many times, just increase the value of "$dialog_exhaustion".  If "$dialog_exhaustion" reaches 3,
 * the plugin will automatically redirect to a node named "Exhausted" within the dialog file.
 * 
 * Please note, if using ANY variable as a type of number, you MUST explicitly set it to a value before doing any addition
 * or subtraction.  So call <<set $dialog_exhaustion = 1>> BEFORE doing something like
 * <<set $dialog_exhaustion = $dialog_exhaustion + 1>>.  Otherwise you'll get a NaN error as Javascript has no idea how to
 * add X to nothingness.sample
 * 
 * Supported message functions:
 * - <<set_background 1>> -- Set the background to opacity to 0, 1 or 2
 * 
 * @command yarn
 * @text Yarn Dialog
 * @desc Attach yarn dialog to an NPC
 * @arg Yarn File Path
 * @type text
 * @text Yarn File Path
 * @desc Path to the Yarn Dialog file
 * @arg Start At
 * @type text
 * @text Start At
 * @desc What node to start at?
 */
