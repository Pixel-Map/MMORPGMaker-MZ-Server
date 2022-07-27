import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { GameSocket } from '../types/GameSocket';
import { PlayerData } from './interfaces/playerData.interface';
import { MapService } from './map.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class MapGateway {
  private readonly logger = new Logger(MapGateway.name);
  constructor(private mapService: MapService) {}

  @WebSocketServer()
  server: Server;
}
