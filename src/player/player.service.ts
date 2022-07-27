import { Injectable, Logger } from '@nestjs/common';
import { Player, PlayerRepository } from './player.entity';
import { wrap } from '@mikro-orm/core';

@Injectable()
export class PlayerService {
  private connectedPlayers: Map<string, Player>;
  private readonly logger = new Logger(PlayerService.name);

  constructor(private readonly playerRepo: PlayerRepository) {
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

  async savePlayer(playerData) {
    this.logger.log('Saving playerdata: ' + playerData.username);

    if (typeof playerData.status === 'boolean') {
      throw new Error('E3333');
    }

    const user = await this.playerRepo.findOne({
      username: playerData.username,
    });
    wrap(user).assign(playerData);
    await this.playerRepo.persistAndFlush(user);
  }
}
