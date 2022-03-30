import { isTokenValid } from '../../core/security';
import MMO_Core from '../../core/mmo_core';

const router = require('express').Router();
const mmoCore = MMO_Core.getInstance();
/*****************************
 EXPORTS
 *****************************/

// Send back the configurations of the server
router.get('/:playerId?', isTokenValid, function (req, res) {
    if (!req.params.playerId) {
        mmoCore.database.getPlayers((players) => {
            res.status(200).send(players);
        });
    } else {
        mmoCore.database.findUserById(req.params.playerId, (player) => {
            res.status(200).send(player);
        });
    }
});

router.patch('/', isTokenValid, (req, res) => {
    if (!req.body.username) {
        return;
    }

    mmoCore.database.savePlayerById(req.body, () => {
        res.status(200).send(true);
    });
});

router.delete('/:playerId', isTokenValid, (req, res) => {
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
