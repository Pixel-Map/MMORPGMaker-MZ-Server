import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Web3User } from './interfaces/user.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  async signup(@Body() newUser: Web3User) {
    this.authService.signup(newUser);
    return 'This action adds a new cat';
  }

  @Post('/login')
  async login(@Body() login: Web3User) {
    return this.authService.login(login);
  }
  // @Post('/legacyLogin')
  // async legacyLogin(@Body() login: User) {
  //   return this.authService.login(login);
  // }
}

// /*****************************
//  EXPORTS
//  *****************************/
//
// // Sign up user
// router.post('/signup', async function (req, res) {
//     if (req.body === undefined || (req.body.password && req.body.username) === undefined) {
//         return res.status(403).send({ message: 'Fields missing' });
//     }
//
//     // Verify if user already exist
//     const user = await mmoCore.database.findUser(req.body);
//     if (user !== undefined) {
//         return res.status(500).send({ message: 'User already exist.' });
//     } else {
//         mmoCore.database.registerUser(req.body);
//     }
// });
//
// // Sign in the user
// router.post('/signin', async function (req, res) {
//     if (req.body === undefined || (req.body.password && req.body.username) === undefined) {
//         return res.status(403).send({ message: 'Fields missing' });
//     }
//
//     const user = await mmoCore.database.findUser(req.body);
//     if (user === undefined) {
//         return res.status(500).send({ message: "User doesn't exist" });
//     }
//
//     // If password is incorrect.
//     if (security.hashPassword(req.body.password.toLowerCase()) !== user.password.toLowerCase()) {
//         return res.status(500).send({ message: 'Incorrect password' });
//     }
//
//     // Generate valide JWT and send it back
//     security.generateToken(req, user, function (_err, result) {
//         res.status(200).send(result.token);
//     });
// });
//
// // Logout user from JWT
// router.get('/logout', isTokenValid, function (req, res) {
//     // We filter the variables to get ride of the bad one
//     activeTokens[req.token.decoded.username] = activeTokens[req.token.decoded.username].filter(function (value) {
//         return value.token !== req.token.token;
//     });
//
//     res.status(200).send(true);
// });
//
// /*****************************
//  FUNCTIONS
//  *****************************/
//
// module.exports = router;
