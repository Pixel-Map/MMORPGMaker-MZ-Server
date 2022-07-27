import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from 'nestjs-pino';
import { MapController } from './map/map.controller';
import { MapService } from './map/map.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MapModule } from './map/map.module';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from './auth/auth.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { PlayerModule } from './player/player.module';
import { validate } from './env.validation';
import { Player } from './player/player.entity';

@Module({
  imports: [
    HttpModule,
    MikroOrmModule.forFeature([Player]),
    MikroOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        metadataProvider: TsMorphMetadataProvider,
        entities: [Player],
        type: 'postgresql',
        dbName: configService.get<string>('DATABASE_NAME'),
        host: configService.get<string>('DATABASE_HOST'),
        port: 5432,
        user: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        driverOptions: {
          connection: { ssl: false },
        },
      }),
      inject: [ConfigService],
    }),
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
  ],
  controllers: [AppController, MapController],
  providers: [AppService],
})
export class AppModule {}
