"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
/*****************************
 PUBLIC FUNCTIONS
 *****************************/
var GameData = /** @class */ (function () {
    function GameData() {
        this.path = '../../../game/';
        this.loaded = false;
        this.data = {};
        this.reloadData();
        console.log("[I] ".concat(Object.keys(this.data).length, " game files loaded."));
        console.log('[I] Game data initialized with success.');
        this.loaded = true;
    }
    // Reload the game files data
    GameData.prototype.reloadData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var correctedPath, stats, files, _i, files_1, file, fileName, fileData, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        correctedPath = "".concat(__dirname, "/").concat(this.path, "data");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        stats = fs.statSync("".concat(correctedPath));
                        if (!stats.isDirectory()) {
                            return [2 /*return*/, console.log("[O] Data folder doesn't seems to exist.")];
                        }
                        files = fs.readdirSync(correctedPath, { withFileTypes: true });
                        _i = 0, files_1 = files;
                        _a.label = 2;
                    case 2:
                        if (!(_i < files_1.length)) return [3 /*break*/, 5];
                        file = files_1[_i];
                        fileName = file.name.split('.json')[0];
                        if (!file.name.includes('.json')) return [3 /*break*/, 4];
                        return [4 /*yield*/, fs.readFileSync("".concat(correctedPath, "/").concat(file.name), { encoding: 'utf-8' })];
                    case 3:
                        fileData = _a.sent();
                        this.data[fileName] = JSON.parse(fileData);
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        e_1 = _a.sent();
                        console.log(e_1);
                        return [2 /*return*/, console.log('[O] Could not find game data directory.')];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    // Save the data back to the game files
    GameData.prototype.saveData = function (dataName) {
        if (this.data[dataName] === undefined) {
            return console.log("[O] Data doesn't seems to exist.");
        }
        var correctedPath = "".concat(__dirname, "/").concat(this.path, "data");
        fs.writeFile("".concat(correctedPath, "/").concat(dataName, ".json"), JSON.stringify(this.data[dataName]), function (err) {
            if (err) {
                return console.log("[O] Error while saving ".concat(dataName));
            }
            console.log("[I] ".concat(dataName, " was saved with success."));
        });
    };
    return GameData;
}());
exports.default = GameData;
