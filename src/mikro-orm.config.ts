import { Logger } from '@nestjs/common';
import { Options } from '@mikro-orm/core';

import { ConfigService } from '@nestjs/config';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Player } from './player/player.entity';
import { ServerConfig } from './common/serverConfig.entity';
import { GlobalSwitch } from './common/globalSwitch.entity';
import { GlobalVariable } from './common/globalVariable.entity';

const configService = new ConfigService();

const config: Options = {
  seeder: {
    path: './dist/seeders',
    pathTs: './src/seeders',
    defaultSeeder: 'DatabaseSeeder', // default seeder class name
    glob: '!(*.d).{js,ts}', // how to match seeder files (all .js and .ts files, but not .d.ts)
    emit: 'ts', // seeder generation mode
    fileName: (className: string) => className, // seeder file naming convention
  },
  metadataProvider: TsMorphMetadataProvider,
  entities: [Player, ServerConfig, GlobalSwitch, GlobalVariable],
  type: 'postgresql',
  dbName: configService.get<string>('DATABASE_NAME'),
  host: configService.get<string>('DATABASE_HOST'),
  port: 5432,
  user: configService.get<string>('DATABASE_USERNAME'),
  password: configService.get<string>('DATABASE_PASSWORD'),
  driverOptions: {
    connection: { ssl: false },
  },
};

export default config;
