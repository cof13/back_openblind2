import { Module } from '@nestjs/common';
import { RouteModule } from '../rute/rute.module';
import { StationModule } from '../station/station.module';

@Module({
  imports: [
    RouteModule,
    StationModule,
  ],
  exports: [
    RouteModule,
    StationModule,
  ],
})
export class TransportModule {}