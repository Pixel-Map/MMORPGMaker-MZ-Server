/*:
 * @target MZ
 * @author PixelMap
 * @plugindesc Adds support for dynamically loading tile houses
 * @help This plugin allows you to dynamically load/exit individual tile houses.
 * 
 * @param ExitsList
 * @type struct<TileHouse>[]
 * @text Dynamic Exits
 * @desc Dynamic Exit List
 * 
 * @command enter
 * @text Enter Dynamic House
 * @desc Enter a dynamically generated house
 * @arg id
 * @type text
 * @text id
 * @desc id
 * 
 * @command exit
 * @text Exit Dynamic House
 * @desc Exit a dynamically generated house
 * @arg id
 * @type text
 * @text id
 * @desc id
 */
/*~struct~TileHouse:
 * 
 * @param dynamicId
 * @type number
 * @text dynamicId
 * @desc Which dynamic ID are we referring to? 0-3970
 * @min 1
 * @default 1
 * 
 * @param mapId
 * @type number
 * @text Destination Map ID
 * @desc For the given tile house, what map ID should it exit to?
 * @min 1
 * @default 1
 * 
 * @param x
 * @type number
 * @text Exit X
 * @desc What destination X to teleport to?
 * @min 0
 * @default 0
 * 
 * @param y
 * @type number
 * @text Exit Y
 * @desc What destination Y to teleport to?
 * @min 0
 * @default 0
 */
