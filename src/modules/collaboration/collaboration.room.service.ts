import { Injectable } from "@nestjs/common";
import * as Y from "yjs";
import { COLLAB } from "src/modules/collaboration/collaboration.constants";
import { RedisService } from "src/modules/redis/redis.service";

type RoomState = {
  doc: Y.Doc;
  clients: number;
};

@Injectable()
export class CollaborationRoomService {
  private readonly rooms = new Map<string, RoomState>();

  constructor(private readonly redisService: RedisService) {}

  private getRoomKey(roomId: string): string {
    return `${COLLAB.REDIS.ROOM_STATE_KEY_PREFIX}:${roomId}:${COLLAB.REDIS.ROOM_STATE_KEY_SUFFIX}`;
  }

  async getOrCreateDoc(roomId: string): Promise<Y.Doc> {
    const existing = this.rooms.get(roomId);
    if (existing) {
      return existing.doc;
    }

    const doc = new Y.Doc();
    const raw = await this.redisService.get(this.getRoomKey(roomId));

    if (raw) {
      const update = Buffer.from(raw, "base64");
      Y.applyUpdate(doc, update);
    }

    this.rooms.set(roomId, { doc, clients: 0 });
    return doc;
  }

  async persist(roomId: string): Promise<void> {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const full = Y.encodeStateAsUpdate(room.doc);
    await this.redisService.setWithoutExpire(this.getRoomKey(roomId), Buffer.from(full).toString("base64"));
  }

  async addClient(roomId: string): Promise<void> {
    const doc = await this.getOrCreateDoc(roomId);
    const state = this.rooms.get(roomId);
    if (!state) {
      this.rooms.set(roomId, { doc, clients: 1 });
      return;
    }
    state.clients += 1;
  }

  removeClient(roomId: string): void {
    const state = this.rooms.get(roomId);
    if (!state) return;

    state.clients -= 1;
    if (state.clients <= 0) {
      this.rooms.delete(roomId);
    }
  }

  getActiveRoomsCount(): number {
    return this.rooms.size;
  }

  getClientsInRoom(roomId: string): number {
    return this.rooms.get(roomId)?.clients ?? 0;
  }

  async applyUpdate(roomId: string, update: Uint8Array): Promise<void> {
    const doc = await this.getOrCreateDoc(roomId);
    Y.applyUpdate(doc, update);
    await this.persist(roomId);
  }

  async getFullStateUpdate(roomId: string): Promise<Uint8Array> {
    const doc = await this.getOrCreateDoc(roomId);
    return Y.encodeStateAsUpdate(doc);
  }
}
