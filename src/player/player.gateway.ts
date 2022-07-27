import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { GameSocket } from '../types/GameSocket';
import { PlayerData } from '../map/interfaces/playerData.interface';
import { PlayerService } from './player.service';
import { PlayerMovementUpdateDto } from './interfaces/playerMovementUpdate.dto';
import { WebSocketGuard } from '../guards/websocket.guard';
import { CommonService } from '../common/common.service';
import { UpdateStatsDTO } from './interfaces/update-stats.to';

@UseGuards(WebSocketGuard)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class PlayerGateway implements OnGatewayDisconnect {
  private readonly logger = new Logger(PlayerGateway.name);

  constructor(
    private readonly playerService: PlayerService,
    private readonly commonService: CommonService,
  ) {}

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
  playerUpdateSwitches(client: GameSocket, switches: any) {
    client.playerData.switches = switches;
  }

  @SubscribeMessage('player_moving')
  async playerMoving(client: GameSocket, payload: PlayerMovementUpdateDto) {
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

  @SubscribeMessage('player_update_stats')
  async playerUpdateStats(client: GameSocket, data: UpdateStatsDTO) {
    const playerData = Object.assign(client.playerData, data);

    // await database.savePlayer(playerData);
    delete playerData.password; // We delete the password from the result sent back
    client.emit('refresh_player_data', playerData);
  }

  @SubscribeMessage('map_joined')
  async mapJoined(client: GameSocket, playerData: PlayerData) {
    // Update playerData, this should be moved!
    playerData.ens = client.playerData.ens;
    playerData.username = client.playerData.username; // Temporary way to pass the username
    playerData.skin = client.playerData.skin;

    this.loadExistingPlayers(client, playerData);
    this.leavePreviousMap(client, playerData);
    this.updateClientLocation(client, playerData);
    this.updateGlobalSwitches(client); // Update global switches
    this.updateGlobalVariables(client); // Update global variables
    this.notifyExistingPlayersOfMapJoin(client, playerData); // Notify everyone on map that the player has joined
    this.fetchConnectedNPCs(client, playerData); // Retrieve all NPCs currently connected to the map

    this.logger.log(client.playerData.username + ' joined ' + client.lastMap);
  }

  fetchConnectedNPCs(client: GameSocket, playerData: PlayerData) {
    // const npcs = gameworld.getConnectedNpcs(parseInt(client.playerData.mapId));
    // if (npcs && npcs.length) {
    //   client.emit('npcsFetched', {
    //     playerId: client.playerData.id,
    //     npcs,
    //   });
    // }
  }

  // Update the game location data on the client socket
  updateClientLocation(client: GameSocket, playerData: PlayerData) {
    // Storing the new location (in case of disconnecting on a local map)
    client.playerData.x = playerData.x;
    client.playerData.y = playerData.y;
    client.playerData.mapId = playerData.mapId;

    // Join the appropriate socket room
    client.join('map-' + playerData.mapId);

    // Update lastMap
    client.lastMap = 'map-' + playerData.mapId;
  }

  // Let the existing players on map know a player has entered
  notifyExistingPlayersOfMapJoin(client: GameSocket, playerData: PlayerData) {
    client.broadcast.to('map-' + playerData.mapId).emit('map_joined', {
      id: client.playerData.id,
      playerData: playerData,
    });
    client.broadcast
      .to('map-' + playerData.mapId)
      .emit('refresh_players_position', client.playerData.id);
  }

  // Let everyone know that the player has left the previous map
  leavePreviousMap(client: GameSocket, playerData: PlayerData) {
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
  }

  // If the player is joining a map that already has other players, load them now.
  loadExistingPlayers(client: GameSocket, playerData: PlayerData) {
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
  }

  updateGlobalSwitches(client: GameSocket) {
    for (const switchKey of this.commonService.getGlobalSwitches()) {
      client.emit('player_update_switch', {
        switchId: switchKey[0],
        value: switchKey[1],
      });
    }
  }

  updateGlobalVariables(client: GameSocket) {
    for (const variable of this.commonService.getGlobalVariables()) {
      client.emit('player_update_variable', {
        variableId: variable[0],
        value: variable[1],
      });
    }
  }
}
