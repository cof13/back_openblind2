import { Module } from '@nestjs/common';
import { RouteModule } from './rute.module';
import { StationModule } from './station.module';

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