import { Module } from "@nestjs/common";

import { MetricsController } from "./metrics.controller";
import { MetricsService } from "./metrics.service";

@Module({
  providers: [MetricsService],
  exports: [MetricsService],
  controllers: [MetricsController],
})
export class MetricsModule {}
