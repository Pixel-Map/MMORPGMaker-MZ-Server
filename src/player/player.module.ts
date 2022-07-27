import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerGateway } from './player.gateway';

@Module({
  providers: [PlayerService, PlayerGateway],
  exports: [PlayerService],
})
export class PlayerModule {}
