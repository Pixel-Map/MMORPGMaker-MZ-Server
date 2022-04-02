import { activeTokens, isTokenValid } from '../../core/security';
import MMO_Core from '../../core/mmo_core';

const mmoCore = MMO_Core.getInstance();
const security = require('../../core/security');
const router = require('express').Router();

/*****************************
 EXPORTS
 *****************************/

// Sign in the user
router.post('/signin', async function (req, res) {
    if (req.body === undefined || (req.body.password && req.body.username) === undefined) {
        return res.status(403).send({ message: 'Fields missing' });
    }

    const user = await mmoCore.database.findUser(req.body);
    if (user === undefined) {
        return res.status(500).send({ message: "Player doesn't exist" });
    }

    // If password is incorrect.
    if (security.hashPassword(req.body.password.toLowerCase()) !== user.password.toLowerCase()) {
        return res.status(500).send({ message: 'Incorrect password' });
    }

    // If permission is incorrect
    if (user.permission < 100) {
        return res.status(500).send({ message: 'You are not permitted to use this page.' });
    }

    // Generate valide JWT and send it back
    security.generateToken(req, user, function (_err, result) {
        res.status(200).send(result);
    });
});

// Logout user from JWT
router.get('/logout', isTokenValid, function (req, res) {
    // We filter the variables to get ride of the bad one
    activeTokens[req.token.decoded.username] = activeTokens[req.token.decoded.username].filter(function (value) {
        return value.token !== req.token.token;
    });

    res.status(200).send(true);
});

/*****************************
 FUNCTIONS
 *****************************/

module.exports = router;
