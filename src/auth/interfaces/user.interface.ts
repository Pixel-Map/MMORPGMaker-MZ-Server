import { IsNotEmpty } from 'class-validator';

export class Web3User {
  @IsNotEmpty()
  payload: {
    sessionToken: string;
  };
}
