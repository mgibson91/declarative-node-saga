import { Queue } from "./queue";
import { getLogger } from "./logger";
import { v4 as uuid } from "uuid";
import { RollbackHandler } from "./command/handlers/rollback/types";

export async function executeRollbackStep(input: {
  handler: RollbackHandler;
  sagaId: string;
  stepId: string;
  payload: any;
}) {
  const { handler, payload, stepId, sagaId } = input;
  const logger = getLogger("executeRollbackStep", { correlationId: uuid() });
  try {
    const start = Date.now();
    logger.info(payload, "Executing");

    const data = await handler(input);

    logger.info({ durationMs: Date.now() - start }, "Executed");

    Queue.publishSagaRollback({
      sagaId,
      stepId,
      data,
    });
  } catch (e) {
    const message =
      "CRITICAL - Error continuing saga rollback. Intervention required";
    logger.error({ sagaId, stepId }, message);
    throw new Error(message);
  }
}
