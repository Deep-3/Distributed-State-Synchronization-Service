import { ApiPropertyWritable } from "../swagger/swagger.writable.decorator";

export class MetricsResponse {
  @ApiPropertyWritable()
  connectedClients: number;

  @ApiPropertyWritable()
  activeRooms: number;

  @ApiPropertyWritable()
  updatesPerSecond: number;

  @ApiPropertyWritable({ nullable: true })
  roomId?: string;

  @ApiPropertyWritable({ nullable: true })
  roomActive?: boolean;

  @ApiPropertyWritable({ nullable: true })
  roomConnectedClients?: number;

  @ApiPropertyWritable({ nullable: true })
  roomUpdatesPerSecond?: number;
}
