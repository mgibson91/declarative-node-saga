import { Queue } from "./queue";
import { getLogger } from "./logger";
import { v4 as uuid } from "uuid";

export async function executeStep({
  sagaId,
  stepId,
  stepInput,
  sagaInput,
  metadata,
  handler,
}: {
  sagaId: string;
  stepId: string;
  stepInput: any;
  sagaInput: any;
  metadata?: any;
  handler: any;
}) {
  const logger = getLogger("executeStep", { correlationId: uuid() });
  try {
    const start = Date.now();
    logger.info({ sagaId, stepId, stepInput, metadata }, "Executing");

    const data = await handler({
      stepInput,
      sagaInput,
      sagaId,
      stepId,
      metadata,
    });

    logger.info({ durationMs: Date.now() - start }, "Executed");

    Queue.publishSagaStepComplete({
      sagaId,
      stepId,
      data,
    });
  } catch (e) {
    logger.error(e, "Failed to execute");

    Queue.publishSagaRollback({
      sagaId,
      stepId,
      message: (e as Error).message,
    });
  }
}
