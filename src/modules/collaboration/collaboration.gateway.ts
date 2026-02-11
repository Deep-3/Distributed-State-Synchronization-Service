import { Logger as NestLogger } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";

import { collaborationConfig } from "src/config/collaboration.config";
import { COLLAB } from "src/modules/collaboration/collaboration.constants";
import { MetricsService } from "src/modules/metrics/metrics.service";

import { CollaborationPubSubService } from "./collaboration.pubsub";
import { CollaborationRoomService } from "./collaboration.room.service";

import type { Server, Socket } from "socket.io";

type JoinPayload = {
  roomId: string;
};

type UpdatePayload = {
  roomId: string;
  updateBase64: string;
};

@WebSocketGateway({
  namespace: COLLAB.WS_NAMESPACE,
  cors: collaborationConfig.cors,
})
export class CollaborationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  private readonly logger = new NestLogger(CollaborationGateway.name);
  private readonly clientRoom = new Map<string, string>();

  constructor(
    private readonly roomService: CollaborationRoomService,
    private readonly pubsub: CollaborationPubSubService,
    private readonly metrics: MetricsService,
  ) {
    this.pubsub.onMessage((msg) => {
      void this.applyRemoteUpdate(msg.roomId, msg.updateBase64);
    });
  }

  private isValidBase64(value: string): boolean {
    if (!value) return false;
    if (value.length % 4 !== 0) return false;
    return /^[A-Za-z0-9+/]+={0,2}$/.test(value);
  }

  private async applyRemoteUpdate(roomId: string, updateBase64: string): Promise<void> {
    try {
      const update = Buffer.from(updateBase64, "base64");
      await this.roomService.applyUpdate(roomId, update);
      this.metrics.recordUpdate(roomId);
      this.server.to(roomId).emit(COLLAB.EVENTS.UPDATE, {
        roomId,
        updateBase64,
        senderId: "remote",
        ts: Date.now(),
      });
    } catch (error) {
      this.logger.error(`Failed to apply remote update for room ${roomId}`, error as Error);
    }
  }

  handleConnection(client: Socket): void {
    this.metrics.incConnectedClients();
    this.logger.log(`Client connected: ${client.id}`);
    client.emit(COLLAB.EVENTS.CONNECTED, { id: client.id });
  }

  handleDisconnect(client: Socket): void {
    this.metrics.decConnectedClients();
    this.logger.log(`Client disconnected: ${client.id}`);

    const roomId = this.clientRoom.get(client.id);
    if (roomId) {
      this.roomService.removeClient(roomId);
      this.metrics.decRoomClients(roomId);
      this.metrics.setActiveRooms(this.roomService.getActiveRoomsCount());
      this.clientRoom.delete(client.id);
    }
  }

  @SubscribeMessage(COLLAB.EVENTS.JOIN)
  async onJoin(@ConnectedSocket() client: Socket, @MessageBody() body?: JoinPayload): Promise<void> {
    const roomId = body?.roomId;
    if (!roomId) {
      client.emit(COLLAB.EVENTS.ERROR, { message: "roomId is required" });
      return;
    }

    try {
      await client.join(roomId);
      this.clientRoom.set(client.id, roomId);
      await this.roomService.addClient(roomId);
      this.metrics.incRoomClients(roomId);
      this.metrics.setActiveRooms(this.roomService.getActiveRoomsCount());

      const full = await this.roomService.getFullStateUpdate(roomId);
      client.emit(COLLAB.EVENTS.SYNC, {
        roomId,
        updateBase64: Buffer.from(full).toString("base64"),
        senderId: "server",
        ts: Date.now(),
      });
    } catch (error) {
      this.logger.error(`Failed to join room ${roomId}`, error as Error);
      client.emit(COLLAB.EVENTS.ERROR, { message: "Failed to join room" });
    }
  }

  @SubscribeMessage(COLLAB.EVENTS.UPDATE)
  async onUpdate(@ConnectedSocket() client: Socket, @MessageBody() body: UpdatePayload): Promise<void> {
    const { roomId, updateBase64 } = body;

    if (!roomId || !updateBase64) {
      client.emit(COLLAB.EVENTS.ERROR, {
        message: "roomId and updateBase64 are required",
      });
      return;
    }

    if (!this.isValidBase64(updateBase64)) {
      client.emit(COLLAB.EVENTS.ERROR, { message: "Invalid base64 update" });
      return;
    }

    const update = Buffer.from(updateBase64, "base64");

    try {
      await this.roomService.applyUpdate(roomId, update);
      this.metrics.recordUpdate(roomId);

      client.to(roomId).emit(COLLAB.EVENTS.UPDATE, {
        roomId,
        updateBase64,
        senderId: client.id,
        ts: Date.now(),
      });

      await this.pubsub.publish(roomId, updateBase64);
    } catch (error) {
      this.logger.error(`Failed to apply update for room ${roomId}`, error as Error);
      client.emit(COLLAB.EVENTS.ERROR, { message: "Invalid Yjs update" });
    }
  }
}
