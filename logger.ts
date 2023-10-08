import pino from "pino";

export const logger = pino({
  level: process.env.PINO_LOG_LEVEL || "debug", // TODO: Default to info
  transport: {
    target: "pino-pretty",
  },
});

export const getLogger = (context: string, args?: object) => {
  return logger.child({ context, ...args });
};
