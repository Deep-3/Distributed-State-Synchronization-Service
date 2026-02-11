import { getOsEnv } from "./env.config";

export const appConfig = {
  port: +(process.env.PORT ?? 3000),
  environment: getOsEnv("ENVIRONMENT"),
  allowedOrigins: getOsEnv("ALLOWED_ORIGINS"),
  isLocal: getOsEnv("ENVIRONMENT") === "local",
  throttle: {
    ttl: +getOsEnv("THROTTLE_TTL"),
    limit: +getOsEnv("THROTTLE_LIMIT"),
  },
};
