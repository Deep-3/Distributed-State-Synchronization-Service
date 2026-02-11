import { getOsEnvOptional } from "../config/env.config"; // Assuming this function is already defined

export const redisConfig = {
  port: +(getOsEnvOptional("REDIS_PORT") ?? 6379),
  host: getOsEnvOptional("REDIS_HOST") ?? "localhost",
  password: getOsEnvOptional("REDIS_PASSWORD") ?? "",
};
