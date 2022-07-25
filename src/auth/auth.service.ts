import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Web3User } from './interfaces/user.interface';
import { HttpService } from '@nestjs/axios';
import { map } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../entitites/player.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private readonly httpService: HttpService) {}
  private readonly users: Web3User[] = [];
  signup(web3User: Web3User) {
    this.users.push(web3User);
  }
  async login(web3User: Web3User) {
    const data = web3User.payload;

    if (data.sessionToken === undefined) {
      throw new BadRequestException('Missing session token!');
    }
    let userId = '';

    // Validate session token
    let response = await lastValueFrom(
      this.httpService
        .get('https://orrqu4njimxw.usemoralis.com:2053/server/sessions', {
          headers: {
            'X-Parse-Application-Id': process.env.MORALIS_APPLICATION_ID,
            'X-Parse-Master-Key': process.env.MORALIS_MASTER_KEY,
            'content-type': 'application/x-www-form-urlencoded',
          },
          data: `where={"sessionToken": "${data.sessionToken}"}`,
        })
        .pipe(map((resp) => resp.data)),
    );
    userId = response.results[0].user.objectId;

    // Get Ethereum Address and other data
    response = await lastValueFrom(
      this.httpService
        .get('https://orrqu4njimxw.usemoralis.com:2053/server/classes/_User', {
          headers: {
            'X-Parse-Application-Id': process.env.MORALIS_APPLICATION_ID,
            'X-Parse-Master-Key': process.env.MORALIS_MASTER_KEY,
            'content-type': 'application/x-www-form-urlencoded',
          },
          data: `where={"objectId": "${userId}"}`,
        })
        .pipe(map((resp) => resp.data)),
    );
    const moralisData = response.results[0];

    // Attempt to get ENS
    let ens = '';
    response = await lastValueFrom(
      this.httpService
        .get(
          `https://deep-index.moralis.io/api/v2/resolve/${moralisData.ethAddress}/reverse`,
          {
            headers: {
              accept: 'application/json',
              'X-API-Key': process.env.MORALIS_API_KEY,
            },
          },
        )
        .pipe(map((resp) => resp.data)),
    );
    ens = response.name;
    // No ENS found for player, using first 10 of eth address!
    if (!ens) {
      ens = moralisData.ethAddress.slice(0, 10);
    }
    this.logger.log(ens);

    //
    //   let user = await database.findUser({ username: moralisData.ethAddress });
    //
    //   if (user == undefined) {
    //     await database.registerUser({
    //       username: moralisData.ethAddress,
    //       password: 'moralis',
    //       ens: ens,
    //     });
    //     user = await database.findUser({ username: moralisData.ethAddress });
    //   }
    //
    //   const existingPlayer = await mmoCore.socket.modules.player.getPlayer(
    //     moralisData.ethAddress,
    //   );
    //   if (user.ens != ens) {
    //     console.log("Player's ENS changed, updating!");
    //     user.ens = ens;
    //     database.savePlayer(user);
    //   }
    //   if (existingPlayer !== null) {
    //     return this.loginError(client, 'Player is already connected.');
    //   }
    //   return this.loginSuccess(client, user, mmoCore);
    // }
  }
}
