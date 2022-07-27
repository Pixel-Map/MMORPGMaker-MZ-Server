import { Module } from '@nestjs/common';

import { MapGateway } from './map.gateway';
import { MapService } from './map.service';

@Module({ providers: [MapGateway, MapService], exports: [MapService] })
export class MapModule {}
