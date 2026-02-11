import { Controller, Get, Query, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { ApiTag } from "src/constants/api-tags.constants";
import { ApiSwaggerResponse } from "src/modules/swagger/swagger.decorator";
import responseUtils, { CommonResponseType } from "src/utils/response.utils";

import { GetMetricsQueryDto } from "./metrics-query.dto";
import { MetricsResponse } from "./metrics.response";
import { MetricsService } from "./metrics.service";

import type { Response } from "express";

@ApiTags(ApiTag.Metrics)
@Controller("metrics")
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  @ApiSwaggerResponse(MetricsResponse)
  @Get()
  getMetrics(
    @Res() res: Response,
    @Query() { roomId }: GetMetricsQueryDto,
  ): Response<CommonResponseType<MetricsResponse>> {
    const base: MetricsResponse = {
      connectedClients: this.metrics.connectedClients,
      activeRooms: this.metrics.activeRooms,
      updatesPerSecond: this.metrics.getUpdatesPerSecond(),
    };

    if (roomId) {
      const roomClients = this.metrics.getRoomConnectedClients(roomId);
      return responseUtils.success(res, {
        data: {
          ...base,
          roomId,
          roomActive: roomClients > 0,
          roomConnectedClients: roomClients,
          roomUpdatesPerSecond: this.metrics.getRoomUpdatesPerSecond(roomId),
        },
      });
    }

    return responseUtils.success(res, {
      data: {
        ...base,
      },
    });
  }
}
