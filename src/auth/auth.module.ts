import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from '../entitites/player.entity';
import { Skin } from '../entitites/skin.entity';
import { Stats } from '../entitites/stats.entity';

@Module({ imports: [TypeOrmModule.forFeature([Player, Skin, Stats])] })
export class AuthModule {}
