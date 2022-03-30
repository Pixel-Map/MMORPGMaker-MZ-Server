"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var security_1 = require("../../core/security");
var mmo_core_1 = __importDefault(require("../../core/mmo_core"));
var router = require('express').Router();
var mmoCore = mmo_core_1.default.getInstance();
/*****************************
 EXPORTS
 *****************************/
// Send back the configurations of the server
router.get('/:playerId?', security_1.isTokenValid, function (req, res) {
    if (!req.params.playerId) {
        mmoCore.database.getPlayers(function (players) {
            res.status(200).send(players);
        });
    }
    else {
        mmoCore.database.findUserById(req.params.playerId, function (player) {
            res.status(200).send(player);
        });
    }
});
router.patch('/', security_1.isTokenValid, function (req, res) {
    if (!req.body.username) {
        return;
    }
    mmoCore.database.savePlayerById(req.body, function () {
        res.status(200).send(true);
    });
});
router.delete('/:playerId', security_1.isTokenValid, function (req, res) {
    if (!req.params.playerId) {
        return;
    }
    // mmoCore.database.deleteUser(req.params.playerId, () => {
    //     res.status(200).send(true);
    // });
});
/*****************************
 FUNCTIONS
 *****************************/
module.exports = router;
