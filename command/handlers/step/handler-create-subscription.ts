import { executeStep } from "../../../execute-step";
import { getLogger } from "../../../logger";
import { v4 as uuid } from "uuid";
import { database } from "../../../database";
import { RollbackCommand } from "../../contracts";
import { HandlerInput } from "./types";

export async function createSubscription(
  input: HandlerInput<{ orderId: string; paymentId: string }>
) {
  await executeStep({
    ...input,
    handler: ({
      sagaId,
      stepId,
      stepInput,
    }: HandlerInput<{ orderId: string; paymentId: string }>) => {
      getLogger("createSubscription").info(
        { sagaId, stepId, stepInput },
        "Triggering"
      );

      const id = uuid();

      /** TRANSACTION - START */
      database["subscriptions"].push({
        id,
        orderId: stepInput.orderId,
        paymentId: stepInput.paymentId,
      });

      database["rollbackOperations"].push({
        sagaId,
        stepId,
        command: RollbackCommand.CreateSubscription,
        payload: { id },
      });
      /** TRANSACTION - END */

      return { subscriptionId: id };
    },
  });
}
