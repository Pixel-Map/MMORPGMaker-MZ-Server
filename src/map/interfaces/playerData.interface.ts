import { IsNotEmpty } from 'class-validator';
import { Skin } from '../../player/skin.entity';

export class PlayerData {
  @IsNotEmpty()
  mapId: number;

  ens: string;
  username: string;
  skin: Skin;
  x: number;
  y: number;
}
