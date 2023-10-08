import { getLogger } from "../../../logger";
import { database } from "../../../database";
import { RollbackHandler } from "./types";

export const rollbackTakePayment: RollbackHandler = async (input) => {
  const { sagaId, stepId, payload } = input;
  getLogger("rollbackTakePayment").info(
    { sagaId, stepId, payload },
    "Triggering"
  );

  const id = payload.id; // TODO: Validate

  const index = database["payments"].findIndex((payment) => payment.id === id);

  database.payments.splice(index, 1);
};
