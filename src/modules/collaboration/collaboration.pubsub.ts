import { Inject, Injectable, Logger as NestLogger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Redis } from "ioredis";
import { collaborationConfig } from "src/config/collaboration.config";
import { COLLAB } from "src/modules/collaboration/collaboration.constants";

export type CollaborationPubSubMessage = {
  roomId: string;
  updateBase64: string;
  origin: string;
};

@Injectable()
export class CollaborationPubSubService implements OnModuleInit, OnModuleDestroy {
  private readonly channel = COLLAB.REDIS.UPDATES_CHANNEL;
  private readonly origin = collaborationConfig.instanceId;
  private listeners: Array<(msg: CollaborationPubSubMessage) => void | Promise<void>> = [];
  private readonly logger = new NestLogger(CollaborationPubSubService.name);

  constructor(
    @Inject("REDIS_PUB_CLIENT") private readonly pub: Redis,
    @Inject("REDIS_SUB_CLIENT") private readonly sub: Redis,
  ) {}

  onMessage(listener: (msg: CollaborationPubSubMessage) => void | Promise<void>): void {
    this.listeners.push(listener);
  }

  async publish(roomId: string, updateBase64: string): Promise<void> {
    try {
      const msg: CollaborationPubSubMessage = {
        roomId,
        updateBase64,
        origin: this.origin,
      };
      await this.pub.publish(this.channel, JSON.stringify(msg));
    } catch (error) {
      this.logger.error(`Failed to publish update for room ${roomId}`, error as Error);
    }
  }

  private parseMessage(payload: string): CollaborationPubSubMessage | null {
    try {
      return JSON.parse(payload) as CollaborationPubSubMessage;
    } catch (error) {
      this.logger.warn("Failed to parse pubsub message", error as Error);
      return null;
    }
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.sub.subscribe(this.channel);
      this.sub.on("message", (_channel, payload) => {
        const parsed = this.parseMessage(payload);
        if (!parsed) return;
        if (parsed.origin === this.origin) return;
        for (const l of this.listeners) {
          void l(parsed);
        }
      });
    } catch {
      return;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.sub.unsubscribe(this.channel);
      this.sub.removeAllListeners("message");
    } catch {
      return;
    }
  }
}
