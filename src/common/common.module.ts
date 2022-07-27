import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { ServerConfig } from './serverConfig.entity';
import { GlobalSwitch } from './globalSwitch.entity';
import { GlobalVariable } from './globalVariable.entity';

@Module({
  providers: [CommonService],
  imports: [
    MikroOrmModule.forFeature([ServerConfig, GlobalSwitch, GlobalVariable]),
  ],
  exports: [CommonService],
})
export class CommonModule {}
