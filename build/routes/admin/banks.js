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
router.get('/', security_1.isTokenValid, function (req, res) {
    mmoCore.database.getBanks(function (banks) {
        res.status(200).send(banks);
    });
});
router.post('/', security_1.isTokenValid, function (req, res) {
    console.dir(req.body);
    mmoCore.database.createBank(req.body, function () {
        res.status(200).send();
    });
});
router.delete('/:id', security_1.isTokenValid, function (req, res) {
    if (!req.params.id) {
        return;
    }
    mmoCore.database.deleteBank(req.params.id, function () {
        res.status(200).send();
    });
});
/*****************************
 FUNCTIONS
 *****************************/
module.exports = router;
