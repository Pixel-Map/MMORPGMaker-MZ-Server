import { Module } from '@nestjs/common';
import { AuthGateway } from './auth.gateway';
import { HttpModule } from '@nestjs/axios';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Player } from '../entities/player.entity';
import { PlayerModule } from '../player/player.module';

@Module({
  imports: [PlayerModule, HttpModule, MikroOrmModule.forFeature([Player])],
  providers: [AuthGateway],
})
export class AuthModule {}
