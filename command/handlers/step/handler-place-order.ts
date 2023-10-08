import { executeStep } from "../../../execute-step";
import { getLogger } from "../../../logger";
import { v4 as uuid } from "uuid";
import { database } from "../../../database";
import { RollbackCommand } from "../../contracts";
import { HandlerInput } from "./types";

export async function placeOrder(
  input: HandlerInput<{ productId: string; quantity: number }>
) {
  await executeStep({
    ...input,
    handler: ({
      sagaId,
      stepId,
      stepInput,
    }: HandlerInput<{ productId: string; quantity: number }>) => {
      getLogger("placeOrder").info({ sagaId, stepId, stepInput }, "placeOrder");

      const id = uuid();
      const productId = stepInput.productId;
      const timestamp = new Date();

      /** TRANSACTION - START */
      database["orders"].push({
        id,
        productId,
        quantity: stepInput.quantity,
        placedAt: timestamp,
      });

      database["rollbackOperations"].push({
        sagaId,
        stepId,
        command: RollbackCommand.PlaceOrder,
        payload: {
          id,
          quantity: stepInput.quantity,
          placedAt: timestamp,
        },
      });
      /** TRANSACTION - END */

      return { orderId: id };
    },
  });
}
