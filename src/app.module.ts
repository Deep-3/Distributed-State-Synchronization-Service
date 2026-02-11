import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

import { throttlerConfig } from "./config/throttle.config";
import { CollaborationModule } from "./modules/collaboration/collaboration.module";
import { MetricsModule } from "./modules/metrics/metrics.module";

@Module({
  imports: [ThrottlerModule.forRoot(throttlerConfig), CollaborationModule, MetricsModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
