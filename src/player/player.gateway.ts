import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { GameSocket } from '../types/GameSocket';

import { PlayerData } from '../map/interfaces/playerData.interface';
import { PlayerService } from './player.service';
import { PlayerMovementUpdateDto } from './interfaces/playerMovementUpdate.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class PlayerGateway implements OnGatewayDisconnect {
  private readonly logger = new Logger(PlayerGateway.name);

  constructor(private readonly playerService: PlayerService) {}

  @WebSocketServer()
  server: Server;

  async handleDisconnect(client: GameSocket) {
    if (client.playerData === undefined) {
      return;
    }
    this.playerService.removeConnectedPlayer(client.playerData);
    this.logger.log(client.playerData.username + ' has disconnected');
  }

  @SubscribeMessage('player_update_switches')
  async playerUpdateSwitches(client: GameSocket, switches: any) {
    if (client.playerData === undefined) {
      return;
    }
    client.playerData.switches = switches;
  }

  @SubscribeMessage('player_moving')
  async playerMoving(client: GameSocket, payload: PlayerMovementUpdateDto) {
    if (client.playerData === undefined) {
      return;
    }

    payload.id = client.playerData.id;
    client.playerData.x = payload.x;
    client.playerData.y = payload.y;
    client.playerData.mapId = payload.mapId;

    this.playerService.updateConnectedPlayerLocation(
      client.playerData.id,
      client.playerData.x,
      client.playerData.y,
      client.playerData.mapId,
    );

    client.broadcast
      .to('map-' + client.playerData.mapId)
      .emit('player_moving', payload);
  }

  @SubscribeMessage('refresh_players_on_map')
  async refreshPlayersOnMap(client: GameSocket, data: any) {
    if (data && data.playerData) {
      client.broadcast
        .to('map-' + data.playerData.mapId)
        .emit('refresh_players_on_map', {
          playerId: data.id,
          playerData: data.playerData,
        });
    }
  }

  @SubscribeMessage('map_joined')
  async mapJoined(client: GameSocket, playerData: PlayerData) {
    if (client.playerData === undefined) {
      return;
    }

    // If players already connected, let the person who just joined know who is ALREADY there
    const currentPlayersOnMap = this.playerService.getCurrentPlayersOnMap(
      playerData.mapId,
    );
    for (const connectedPlayer of currentPlayersOnMap) {
      if (connectedPlayer.id != client.playerData.id) {
        client.emit('map_joined', {
          id: connectedPlayer.id,
          playerData: connectedPlayer,
        });
      }
    }
    if (
      client.lastMap !== undefined &&
      client.lastMap !== 'map-' + playerData.mapId
    ) {
      client.broadcast
        .to(client.lastMap)
        .emit('map_exited', client.playerData.id);
      client.leave(client.lastMap);

      this.logger.debug(client.playerData.username + ' left ' + client.lastMap);
    }
    playerData.ens = client.playerData.ens;
    playerData.username = client.playerData.username; // Temporary way to pass the username
    playerData.skin = client.playerData.skin;

    // Storing the new location (in case of disconnecting on a local map)
    client.playerData.x = playerData.x;
    client.playerData.y = playerData.y;
    client.playerData.mapId = playerData.mapId;

    // Update global switches
    // for (const switchKey in database.SERVER_CONFIG.globalSwitches) {
    //   client.emit('player_update_switch', {
    //     switchId: switchKey,
    //     value: database.SERVER_CONFIG.globalSwitches[switchKey],
    //   });
    // }

    // Update global variables
    // for (const varKey in database.SERVER_CONFIG.globalVariables) {
    //   client.emit('player_update_variable', {
    //     variableId: varKey,
    //     value: database.SERVER_CONFIG.globalVariables[varKey],
    //   });
    // }

    client.join('map-' + playerData.mapId);
    client.lastMap = 'map-' + playerData.mapId;

    client.broadcast.to('map-' + playerData.mapId).emit('map_joined', {
      id: client.playerData.id,
      playerData: playerData,
    });
    client.broadcast
      .to('map-' + playerData.mapId)
      .emit('refresh_players_position', client.playerData.id);

    // const npcs = gameworld.getConnectedNpcs(parseInt(client.playerData.mapId));
    // if (npcs && npcs.length) {
    //   client.emit('npcsFetched', {
    //     playerId: client.playerData.id,
    //     npcs,
    //   });
    // }

    this.logger.log(client.playerData.username + ' joined ' + client.lastMap);
  }
}
