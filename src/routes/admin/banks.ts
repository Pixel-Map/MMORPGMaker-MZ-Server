import { isTokenValid } from '../../core/security';
import MMO_Core from '../../core/mmo_core';

const router = require('express').Router();
const mmoCore = MMO_Core.getInstance();
/*****************************
 EXPORTS
 *****************************/

// Send back the configurations of the server
router.get('/', isTokenValid, function (req, res) {
    mmoCore.database.getBanks((banks) => {
        res.status(200).send(banks);
    });
});

router.post('/', isTokenValid, (req, res) => {
    console.dir(req.body);
    mmoCore.database.createBank(req.body, () => {
        res.status(200).send();
    });
});

router.delete('/:id', isTokenValid, function (req, res) {
    if (!req.params.id) {
        return;
    }

    mmoCore.database.deleteBank(req.params.id, () => {
        res.status(200).send();
    });
});

/*****************************
 FUNCTIONS
 *****************************/

module.exports = router;
