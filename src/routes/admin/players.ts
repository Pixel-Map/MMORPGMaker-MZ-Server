import { isTokenValid } from '../../core/security';
import MMO_Core from '../../core/mmo_core';

const router = require('express').Router();
const mmoCore = MMO_Core.getInstance();
/*****************************
 EXPORTS
 *****************************/

// Send back the configurations of the server
router.get('/:playerId?', isTokenValid, async (req, res) => {
    if (!req.params.playerId) {
        const players = await mmoCore.database.getPlayers();
        res.status(200).send(players);
    } else {
        const player = await mmoCore.database.findUserById(req.params.playerId);
        res.status(200).send(player);
    }
});

router.patch('/', isTokenValid, async (req, res) => {
    if (!req.body.username) {
        return;
    }

    await mmoCore.database.savePlayerById(req.body);
    res.status(200).send(true);
});

router.delete('/:playerId', isTokenValid, (req, res) => {
    if (!req.params.playerId) {
        return res.status(400).json({ error: 'Bad Request' });
    }
    return res.json({ success: true });
});

module.exports = router;
