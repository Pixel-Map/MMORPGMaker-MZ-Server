import { isTokenValid } from '../../core/security';
import MMO_Core from '../../core/mmo_core';

const router = require('express').Router();
const mmoCore = MMO_Core.getInstance();
/*****************************
 EXPORTS
 *****************************/

// Send back the configurations of the server
router.get('/', isTokenValid, function (req, res) {
    const payload = {
        serverConfig: mmoCore.database.SERVER_CONFIG,
        gameData: mmoCore.gamedata.data,
    };

    res.status(200).send(payload);
});

// Send back the configurations of the server
router.patch('/:type', isTokenValid, function (req, res) {
    if (!req.body) {
        return;
    }

    mmoCore.database.changeConfig(req.params.type, req.body, () => {
        res.status(200).send(true);
    });
});

/*****************************
 FUNCTIONS
 *****************************/

module.exports = router;
