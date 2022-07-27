import { Injectable } from '@nestjs/common';
import { Player } from '../entities/player.entity';

@Injectable()
export class PlayerService {
  private connectedPlayers: Map<string, Player>;

  constructor() {
    this.connectedPlayers = new Map();
  }

  public addConnectedPlayer(player: Player) {
    if (player instanceof Player) {
      this.connectedPlayers.set(player.id, player);
    }
  }

  public removeConnectedPlayer(player: Player) {
    this.connectedPlayers.delete(player.id);
  }

  public updateConnectedPlayerLocation(playerId, x, y, mapId) {
    const player = this.connectedPlayers.get(playerId);

    if (player) {
      player.x = x;
      player.y = y;
      player.mapId = mapId;
      this.connectedPlayers.set(playerId, player);
    }
  }

  public getCurrentPlayersOnMap(mapId: number) {
    return [...this.connectedPlayers.values()].filter(
      (player: Player) => player.mapId === mapId,
    );
  }
}
