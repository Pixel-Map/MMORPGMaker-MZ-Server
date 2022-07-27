import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerGateway } from './player.gateway';
import { CommonModule } from '../common/common.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Player } from './player.entity';

@Module({
  imports: [CommonModule, MikroOrmModule.forFeature([Player])],
  providers: [PlayerService, PlayerGateway],
  exports: [PlayerService],
})
export class PlayerModule {}
