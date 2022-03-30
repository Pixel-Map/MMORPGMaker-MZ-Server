"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var security_1 = require("../../core/security");
var mmo_core_1 = __importDefault(require("../../core/mmo_core"));
var gamedata = require('../../core/gamedata');
var router = require('express').Router();
var mmoCore = mmo_core_1.default.getInstance();
/*****************************
 EXPORTS
 *****************************/
// Send back the configurations of the server
router.get('/', security_1.isTokenValid, function (req, res) {
    var payload = {
        serverConfig: mmoCore.database.SERVER_CONFIG,
        gameData: gamedata.data,
    };
    res.status(200).send(payload);
});
// Send back the configurations of the server
router.patch('/:type', security_1.isTokenValid, function (req, res) {
    if (!req.body) {
        return;
    }
    mmoCore.database.changeConfig(req.params.type, req.body, function () {
        res.status(200).send(true);
    });
});
/*****************************
 FUNCTIONS
 *****************************/
module.exports = router;
