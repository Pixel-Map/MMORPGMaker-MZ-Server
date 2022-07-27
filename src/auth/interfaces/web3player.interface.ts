import { IsNotEmpty } from 'class-validator';

export class Web3Player {
  @IsNotEmpty()
  sessionToken: string;
}
