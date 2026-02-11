import { Injectable } from "@nestjs/common";

@Injectable()
export class MetricsService {
  connectedClients = 0;
  activeRooms = 0;
  updates = 0;

  private updateTimestamps: number[] = [];
  private roomUpdateTimestamps = new Map<string, number[]>();
  private roomConnectedClients = new Map<string, number>();

  incConnectedClients(): void {
    this.connectedClients += 1;
  }

  decConnectedClients(): void {
    this.connectedClients = Math.max(0, this.connectedClients - 1);
  }

  incRoomClients(roomId: string): void {
    const next = (this.roomConnectedClients.get(roomId) ?? 0) + 1;
    this.roomConnectedClients.set(roomId, next);
  }

  decRoomClients(roomId: string): void {
    const current = this.roomConnectedClients.get(roomId) ?? 0;
    const next = Math.max(0, current - 1);
    if (next === 0) {
      this.roomConnectedClients.delete(roomId);
      return;
    }
    this.roomConnectedClients.set(roomId, next);
  }

  getRoomConnectedClients(roomId: string): number {
    return this.roomConnectedClients.get(roomId) ?? 0;
  }

  setActiveRooms(count: number): void {
    this.activeRooms = Math.max(0, count);
  }

  recordUpdate(roomId?: string): void {
    this.updates += 1;

    const now = Date.now();
    this.updateTimestamps.push(now);
    this.pruneOldUpdates(now);

    if (roomId) {
      const list = this.roomUpdateTimestamps.get(roomId) ?? [];
      list.push(now);
      this.roomUpdateTimestamps.set(roomId, list);
      this.pruneOldRoomUpdates(roomId, now);
    }
  }

  private pruneOldUpdates(now: number): void {
    const cutoff = now - 1000;
    while (this.updateTimestamps.length > 0 && this.updateTimestamps[0] < cutoff) {
      this.updateTimestamps.shift();
    }
  }

  private pruneOldRoomUpdates(roomId: string, now: number): void {
    const list = this.roomUpdateTimestamps.get(roomId);
    if (!list) return;

    const cutoff = now - 1000;
    while (list.length > 0 && list[0] < cutoff) {
      list.shift();
    }

    if (list.length === 0) {
      this.roomUpdateTimestamps.delete(roomId);
    }
  }

  getUpdatesPerSecond(): number {
    const now = Date.now();
    this.pruneOldUpdates(now);
    return this.updateTimestamps.length;
  }

  getRoomUpdatesPerSecond(roomId: string): number {
    const now = Date.now();
    this.pruneOldRoomUpdates(roomId, now);
    return this.roomUpdateTimestamps.get(roomId)?.length ?? 0;
  }
}
