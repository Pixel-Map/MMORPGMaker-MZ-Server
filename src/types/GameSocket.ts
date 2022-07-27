import { Socket } from 'socket.io';
import { Player } from '../player/player.entity';

export type GameSocket = Socket & {
  playerData: Player;
  id: string;
  lastMap: string;
};
