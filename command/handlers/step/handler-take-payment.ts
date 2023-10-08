import { executeStep } from "../../../execute-step";
import { getLogger } from "../../../logger";
import { v4 as uuid } from "uuid";
import { database } from "../../../database";
import { Command, RollbackCommand } from "../../contracts";
import { HandlerInput } from "./types";

export async function takePayment(input: HandlerInput<{ orderId: string }>) {
  await executeStep({
    ...input,
    handler: ({
      sagaId,
      stepId,
      stepInput,
      metadata,
    }: HandlerInput<{ orderId: string }>) => {
      getLogger("takePayment").info(
        { sagaId, stepId, stepInput, metadata },
        "takePayment"
      );

      const paymentProvider = metadata?.paymentProvider as string | undefined;
      if (!paymentProvider) {
        throw new Error("Missing metadata.paymentProvider");
      }

      const orderId = stepInput.orderId;
      const id = uuid();

      /** TRANSACTION - START */
      database["payments"].push({
        id,
        orderId,
        paymentProvider,
      });

      database["rollbackOperations"].push({
        sagaId,
        stepId,
        command: RollbackCommand.TakePayment,
        payload: { id },
      });

      const deduplicationId = `${Command.TakePayment}-${id}`;
      database["processedEventIds"].push({
        id: deduplicationId,
      });
      /** TRANSACTION - END */

      return { orderId, paymentId: id };
    },
  });
}
