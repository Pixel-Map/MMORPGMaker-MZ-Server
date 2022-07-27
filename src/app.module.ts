import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from 'nestjs-pino';
import { MapController } from './map/map.controller';
import { ConfigModule } from '@nestjs/config';
import { MapModule } from './map/map.module';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from './auth/auth.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PlayerModule } from './player/player.module';
import { validate } from './env.validation';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    HttpModule,
    MikroOrmModule.forRoot(),
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: false,
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport: { target: 'pino-pretty' },
      },
    }),
    MapModule,
    AuthModule,
    PlayerModule,
    CommonModule,
  ],
  controllers: [AppController, MapController],
  providers: [AppService],
})
export class AppModule {}
