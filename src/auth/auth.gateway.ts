import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server } from 'socket.io';
import { Socket } from 'net';
import { Web3Player } from './interfaces/web3player.interface';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Skin } from '../entities/skin.entity';
import { Stats } from '../entities/stats.entity';
import * as crypto from 'crypto';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Player } from '../entities/player.entity';
import { EntityRepository } from '@mikro-orm/postgresql';
import { MikroORM, UseRequestContext } from '@mikro-orm/core';
import { GameSocket } from '../types/GameSocket';
import { PlayerService } from '../player/player.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class AuthGateway {
  private readonly logger = new Logger(AuthGateway.name);
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Player)
    private readonly playerRepo: EntityRepository<Player>,
    private readonly orm: MikroORM,
    private readonly playerService: PlayerService,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('loginMoralis')
  async loginMoralis(
    client: GameSocket,
    data: Web3Player,
  ): Promise<WsResponse<unknown>> {
    const player = await this.login(data);
    client.playerData = player;
    this.playerService.addConnectedPlayer(player);
    this.logger.log(client.playerData.username + ' has connected');
    return { event: 'login_success', data: player };
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
  }
  async login(web3Player: Web3Player) {
    const data = web3Player;
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
    try {
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
    } catch {
      // No ENS found!
      ens = moralisData.ethAddress.slice(0, 10);
    }

    // Verify user is legit
    let player = await this.findPlayer(moralisData.ethAddress);

    if (player == undefined) {
      await this.registerPlayer(this.playerRepo, {
        username: moralisData.ethAddress,
        password: 'moralis',
        ens: ens,
      });
      player = await this.findPlayer(moralisData.ethAddress);
    }
    return player;
  }
  SERVER_CONFIG = {
    id: 1,
    newPlayerDetails: {
      permission: 0,
      mapId: 1,
      x: 5,
      y: 5,
    },
    globalSwitches: new Map(),
    partySwitches: new Map(),
    globalVariables: new Map(),
    offlineMaps: new Map(),
  };

  @UseRequestContext()
  async findPlayer(username) {
    return await this.playerRepo.findOne(
      { username: username },
      {
        populate: ['skin', 'stats'],
      },
    );
  }
  @UseRequestContext()
  async registerPlayer(playerRepository, userDetails) {
    const skin = new Skin();
    const stats = new Stats();
    const user = playerRepository.create({
      username: userDetails.username,
      password: this.hashPassword(userDetails.password.toLowerCase()),
      skin: skin,
      stats: stats,
      mapId: this.SERVER_CONFIG.newPlayerDetails.mapId,
      x: this.SERVER_CONFIG.newPlayerDetails.x,
      y: this.SERVER_CONFIG.newPlayerDetails.y,
      permission: this.SERVER_CONFIG.newPlayerDetails.permission,
    });

    await playerRepository.persistAndFlush(user);
  }

  hashPassword(password) {
    const securityDetails = {
      // eslint-disable-next-line no-irregular-whitespace
      specialSalt: 'SuperSecretKey',
      // eslint-disable-next-line no-irregular-whitespace
      tokenPassphrase: 'keyboard cat',
    };

    return crypto
      .createHmac('sha256', securityDetails.specialSalt)
      .update(password)
      .digest('hex');
  }
}
