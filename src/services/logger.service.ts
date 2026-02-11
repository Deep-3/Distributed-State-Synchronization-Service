import { createLogger, format, transports } from "winston";

import { appConfig } from "../config/app.config";

const { combine, timestamp, splat, prettyPrint, printf, colorize } = format;

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = (): string => {
  return appConfig.environment === "production" ? "debug" : "info";
};

const formatLogger = combine(
  colorize({ all: true }),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  splat(),
  prettyPrint(),
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  printf(({ timestamp: date, level: logLevel, message }) => `${date} ${logLevel}: ${message}`),
);

const loggerTransports = [
  new transports.Console(),
  new transports.File({ filename: "logs/error.log", level: "error" }),
  new transports.File({ filename: "logs/all.log" }),
];

export const logger = createLogger({
  level: level(),
  levels,
  format: formatLogger,
  transports: loggerTransports,
});

export enum metaType {
  Object = "%O",
  String = "%s",
  Json = "%j",
  Number = "%d",
}
