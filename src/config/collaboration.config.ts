import { getOsEnvOptional } from "src/config/env.config";

export const collaborationConfig = {
  instanceId: getOsEnvOptional("INSTANCE_ID") ?? process.pid.toString(),

  cors: {
    origin: (() => {
      const raw = getOsEnvOptional("COLLAB_CORS_ORIGIN");
      if (!raw) return "*";
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    })(),
    credentials: true,
  },
};
