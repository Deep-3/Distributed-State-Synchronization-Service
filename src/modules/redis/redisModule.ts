import { Module } from "@nestjs/common";

import Redis from "ioredis";

import { redisConfig } from "src/config/redis-config";

import { RedisService } from "./redis.service";

@Module({
  providers: [
    {
      provide: "REDIS_CLIENT",
      useValue: new Redis({
        ...redisConfig,
      }),
    },
    {
      provide: "REDIS_PUB_CLIENT",
      useValue: new Redis({
        ...redisConfig,
      }),
    },
    {
      provide: "REDIS_SUB_CLIENT",
      useValue: new Redis({
        ...redisConfig,
      }),
    },
    RedisService,
  ],
  exports: ["REDIS_CLIENT", "REDIS_PUB_CLIENT", "REDIS_SUB_CLIENT", RedisService],
})
export class RedisModule {}
