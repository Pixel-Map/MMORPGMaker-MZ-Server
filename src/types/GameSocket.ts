import { Player } from '../entities/player.entity';
import { Socket } from 'socket.io';
export type GameSocket = Socket & {
  playerData: Player;
  id: string;
  lastMap: string;
};
