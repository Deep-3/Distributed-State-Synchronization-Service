import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { TrimString } from "src/decorators/trim-string.decorator";

export class GetMetricsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @TrimString()
  roomId?: string;
}
