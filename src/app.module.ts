import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { LoggerModule } from 'nestjs-pino';
import { MapController } from './map/map.controller';
import { MapService } from './map/map.service';
import { CoreService } from './core/core.service';
import { ConfigModule } from '@nestjs/config';
import { MapModule } from './map/map.module';
import { CoreModule } from './core/core.module';
import { EventsModule } from './events/events.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from './auth/auth.module';
import { Player } from './entitites/player.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
    }),
    ConfigModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: false,
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport: { target: 'pino-pretty' },
      },
    }),
    MapModule,
    CoreModule,
    EventsModule,
    AuthModule,
  ],
  controllers: [AppController, AuthController, MapController],
  providers: [AppService, AuthService, MapService, CoreService],
})
export class AppModule {}
