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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTokenValid = exports.activeTokens = void 0;
var crypto = __importStar(require("crypto"));
var fs = __importStar(require("fs"));
var jwt = require('jsonwebtoken');
exports.activeTokens = {}; // Allow to have a better control on what are the "active sessions"
// Secret variables 👀
var securityDetails = {
    // eslint-disable-next-line no-irregular-whitespace
    specialSalt: process.env.specialSalt || 'SuperSecretKey',
    // eslint-disable-next-line no-irregular-whitespace
    tokenPassphrase: process.env.tokenPassphrase || 'keyboard cat',
};
// Handle the debugging verbose
// 1 : No debug
// 2 : Only in console
// 3 : Console + File writing
exports.debugVerbose = 3;
// Middleware to ensure that token is valid
// Its in a variable in order be used as a global function
// so it doesn't need to be redeclared in every modules
// eslint-disable-next-line
function isTokenValid(req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    // if there is no token, return an error
    if (!token) {
        return res.status(403).send({ message: 'No token provided.' });
    }
    // verify the token & decode it
    jwt.verify(token, securityDetails.tokenPassphrase, function (err, decoded) {
        var tokenExist = false; // Default value to false for the condition
        // eslint-disable-next-line no-irregular-whitespace
        if (err || exports.activeTokens[decoded.email] === undefined) {
            return res.status(403).send({ message: 'Failed to authenticate token.' });
        }
        // Going through every active user tokens
        for (var k in exports.activeTokens[decoded.email]) {
            if (exports.activeTokens[decoded.email][k].token !== token) {
                continue;
            }
            exports.activeTokens[decoded.email][k].lastAccessed = new Date(); // We update the last accessed value with actual date
            tokenExist = true; // If the token is found, then we turn this variable to true
        }
        // If tokenExist is still on false, then we return that the auth failed.
        if (!tokenExist) {
            return res.status(403).send({ message: 'Failed to authenticate token.' });
        }
        // storing it in the request
        req.token = {
            token: token,
            decoded: decoded,
        };
        next();
    });
}
exports.isTokenValid = isTokenValid;
exports.generateToken = function (requestDetails, userDetails, callback) {
    var error = false;
    var generatedToken = jwt.sign(userDetails, securityDetails.tokenPassphrase, { expiresIn: '1d' }); // We generate the token
    if (exports.activeTokens[requestDetails.body.email] === undefined) {
        exports.activeTokens[requestDetails.body.email] = [];
    }
    // We add the token in the user details
    userDetails.token = generatedToken;
    // We store the token in the active tokens and few info for security
    exports.activeTokens[requestDetails.body.email].push({
        token: userDetails.token,
        userAgent: requestDetails.headers['user-agent'],
        ipAddress: requestDetails.headers['x-forward-for'],
        createdOn: new Date(),
        lastAccessed: new Date(),
    });
    return callback(error, userDetails);
};
exports.loadTokens = function () {
    fs.readFile('./tokens.json', function (err, data) {
        if (err) {
            // eslint-disable-next-line no-return-assign
            return (exports.activeTokens = {});
        }
        exports.activeTokens = JSON.parse(data.toString());
        console.log('[I] ' + Object.keys(JSON.parse(data.toString())).length + ' active JWT loaded from local file!');
    });
};
exports.saveTokens = function () {
    fs.writeFile('./tokens.json', JSON.stringify(exports.activeTokens), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log('[I] Active JWT saved in local file.');
    });
};
// Hash the password using SHA256 algorithm /w a salt 🔐
exports.hashPassword = function (password) {
    return crypto.createHmac('sha256', securityDetails.specialSalt).update(password).digest('hex');
};
exports.generatePassword = function (length) {
    length = length || 10;
    var string = 'abcdefghijklmnopqrstuvwxyz'; // to upper
    var numeric = '0123456789';
    var punctuation = '!@#$%^&*()_+~`|}{[]\\:;?><,./-=';
    var password = '';
    var character = '';
    var entity1, entity2, entity3, hold;
    while (password.length < length) {
        entity1 = Math.ceil(string.length * Math.random() * Math.random());
        entity2 = Math.ceil(numeric.length * Math.random() * Math.random());
        entity3 = Math.ceil(punctuation.length * Math.random() * Math.random());
        hold = string.charAt(entity1);
        hold = entity1 % 2 === 0 ? hold.toUpperCase() : hold;
        character += hold;
        character += numeric.charAt(entity2);
        character += punctuation.charAt(entity3);
        password = character;
    }
    return password;
};
exports.createLog = function (message, type) {
    if (exports.debugVerbose <= 1 || !message) {
        return;
    }
    if (type === 'error') {
        console.error(message);
    }
    else if (type === 'warn') {
        console.warn(message);
    }
    else {
        console.log(message);
    }
    if (exports.debugVerbose >= 3) {
        var fullDate = new Date();
        var todayDate = "".concat(fullDate.getFullYear(), "-").concat(fullDate.getMonth(), "-").concat(fullDate.getDate());
        fs.appendFile("".concat(todayDate, ".log"), "".concat(fullDate.toISOString(), " : ").concat(message, "\r\n"), function (err) {
            if (err) {
                throw err;
            }
        });
    }
};
