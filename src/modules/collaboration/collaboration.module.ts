import { Module } from "@nestjs/common";

import { MetricsModule } from "src/modules/metrics/metrics.module";
import { RedisModule } from "src/modules/redis/redisModule";

import { CollaborationController } from "./collaboration.controller";
import { CollaborationGateway } from "./collaboration.gateway";
import { CollaborationPubSubService } from "./collaboration.pubsub";
import { CollaborationRoomService } from "./collaboration.room.service";

@Module({
  imports: [RedisModule, MetricsModule],
  controllers: [CollaborationController],
  providers: [CollaborationGateway, CollaborationRoomService, CollaborationPubSubService],
})
export class CollaborationModule {}
