import { applyDecorators } from "@nestjs/common";

import { Transform } from "class-transformer";
import { IsString } from "class-validator";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TrimString() {
  return applyDecorators(
    Transform(({ value }) => {
      if (value === null || value === undefined || value === "") {
        return undefined;
      }
      return typeof value === "string" ? value.trim() : value;
    }),
    IsString(),
  );
}
