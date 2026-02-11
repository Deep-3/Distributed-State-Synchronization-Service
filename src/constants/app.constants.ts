import { appConfig } from "src/config/app.config";

export const swaggerInfo = {
  title: "Distributed Service",
  description: "Distributed Service Api Documentation",
};
export const globalPrefix = "api";
export const allowedOrigins = JSON.parse(appConfig.allowedOrigins);
export const ERROR_MESSAGES = {
  INVALID_SID: "Invalid sid",
};
