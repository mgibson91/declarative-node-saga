import { getLogger } from "./logger";
import { Queue } from "./queue";
import { database } from "./database";
import { Command } from "./command/contracts";
import { getStepHandler } from "./command/handlers/step";
import { getRollbackHandler } from "./command/handlers/rollback";

interface SagaStep {
  id: string;
  name: string;
  handler: Command;
  metadata?: Record<string, unknown>;
  eventName: string;
  requiresRollback: boolean;
}

interface Saga {
  id: string;
  steps: SagaStep[];
  input: unknown;
}

const saga: Saga = {
  id: "saga-id",
  input: "my input",
  steps: [
    {
      id: "step-1",
      name: "Place Order",
      handler: Command.PlaceOrder,
      eventName: "order.place",
      requiresRollback: true,
    },
    {
      id: "step-2",
      name: "Take Payment",
      handler: Command.TakePayment,
      metadata: {
        paymentProvider: "stripe",
      },
      eventName: "payment.take",
      requiresRollback: true,
    },
    {
      id: "step-3",
      name: "Create subscription",
      handler: Command.CreateSubscription,
      eventName: "subscription.create",
      requiresRollback: true,
    },
    {
      id: "step-4",
      name: "Send email",
      handler: Command.SendEmail,
      eventName: "email.send",
      requiresRollback: false,
    },
    {
      id: "step-5",
      name: "Trigger error",
      handler: Command.TriggerError,
      eventName: "error",
      requiresRollback: false,
    },
  ],
};

const activeSages = new Map<string, Saga>();

function getNextStep(saga: Saga, currentStepId: string): SagaStep | null {
  const currentStepIndex = saga.steps.findIndex(
    (step) => step.id === currentStepId
  );
  const nextStepIndex = currentStepIndex + 1;
  return saga.steps.length > nextStepIndex ? saga.steps[nextStepIndex] : null;
}

function getPreviousStep(saga: Saga, currentStepId: string): SagaStep | null {
  const currentStepIndex = saga.steps.findIndex(
    (step) => step.id === currentStepId
  );
  const previousStepIndex = currentStepIndex - 1;
  return previousStepIndex >= 0 ? saga.steps[previousStepIndex] : null;
}

export interface SagaEvent {
  sagaId: string;
  stepId: string;
  deduplicationId: string;
  data?: unknown;
  error?: Error;
}

// Event handler function
async function handleStepComplete(event: SagaEvent) {
  const logger = getLogger("handleStepComplete");
  logger.info(event, "Event received");

  const { sagaId, stepId, data, deduplicationId } = event;

  if (deduplicationId) {
    // Only needed in if not idempotent
    const alreadyProcessed = database.processedEventIds.some(
      (e) => e.id === deduplicationId
    );
    if (alreadyProcessed) {
      logger.info(
        { sagaId, stepId, deduplicationId },
        "Event already processed"
      );
      return;
    }
  }

  const saga = activeSages.get(sagaId);

  if (!saga) {
    logger.error({ sagaId }, "Saga not found");
    return;
  }

  // Get next step
  const nextStep = getNextStep(saga, stepId);

  if (!nextStep) {
    logger.info({ sagaId }, "Saga completed");
    return;
  }

  const handler = getStepHandler(nextStep.handler);

  // Execute handler
  await handler({
    sagaInput: saga.input,
    stepInput: data,
    sagaId: saga.id,
    stepId: nextStep.id,
    metadata: nextStep.metadata,
  });
}

async function handleRollback(event: SagaEvent) {
  const logger = getLogger("handleRollback");
  logger.info(event, "Event received");

  const { sagaId, stepId, data, deduplicationId } = event;

  if (deduplicationId) {
    // Only needed in if not idempotent
    const alreadyProcessed = database.processedEventIds.some(
      (e) => e.id === deduplicationId
    );
    if (alreadyProcessed) {
      logger.info(
        { sagaId, stepId, deduplicationId },
        "Event already processed"
      );
      return;
    }
  }

  const saga = activeSages.get(sagaId);

  if (!saga) {
    logger.error({ sagaId }, "Saga not found");
    return;
  }

  // Get rollback action for previous step
  const previousStep = getPreviousStep(saga, stepId);
  if (!previousStep) {
    logger.info({ sagaId }, "Rollback complete");
    return;
  }

  if (!previousStep.requiresRollback) {
    logger.info({ sagaId }, "Rollback not required");

    try {
      Queue.publishSagaRollback({
        sagaId,
        stepId: previousStep.id,
        data,
      });

      return;
    } catch (err) {
      const message =
        "CRITICAL - Error continuing saga rollback. Intervention required";
      logger.error({ sagaId, stepId }, message);
      throw new Error(message);
    }
  }

  // Get rollback operation from DB
  const rollbackOperation = database.rollbackOperations.find((op) => {
    return op.sagaId === sagaId && op.stepId === previousStep.id;
  });

  if (!rollbackOperation) {
    const message = "CRITICAL - Rollback operation not found";
    logger.error({ sagaId, stepId }, message);
    throw new Error(message);
  }

  // Execute rollback
  try {
    const rollbackHandler = getRollbackHandler(rollbackOperation.command);

    const start = Date.now();
    logger.info(
      { sagaId, stepId: previousStep.id, command: rollbackOperation.command },
      "Executing rollback step"
    );

    await rollbackHandler({
      payload: rollbackOperation.payload,
      sagaId,
      stepId,
    });

    logger.info({ durationMs: Date.now() - start }, "Executed rollback step");

    Queue.publishSagaRollback({
      sagaId,
      stepId: previousStep.id,
    });
  } catch (error) {
    logger.error(
      { sagaId, stepId: previousStep.id, error },
      "CRITICAL - Rollback stopped as step failed. Intervention required"
    );
  }
}

async function startSaga(saga: Saga, input: unknown) {
  // Verify all steps are unique
  const stepIds = saga.steps.map((step) => step.id);
  const uniqueStepIds = new Set(stepIds);
  if (stepIds.length !== uniqueStepIds.size) {
    throw new Error("Duplicate step ids");
  }

  activeSages.set(saga.id, saga);
  const firstStep = saga.steps[0];

  const handler = getStepHandler(firstStep.handler);

  // Execute handler
  await handler({
    sagaInput: saga.input,
    stepInput: saga.input,
    sagaId: saga.id,
    stepId: firstStep.id,
    metadata: firstStep.metadata,
  });
}

// Subscribe to the "userLoggedIn" event using the registerEventListener function
Queue.registerSagaStepCompleteListener(handleStepComplete);
Queue.registerSagaRollbackListener(handleRollback);

startSaga(saga, { productId: "a", quantity: 2 });

(async () => {
  await new Promise((resolve) => setTimeout(resolve, 60000));
})();
