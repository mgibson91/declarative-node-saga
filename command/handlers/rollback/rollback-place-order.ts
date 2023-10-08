import { getLogger } from "../../../logger";
import { database } from "../../../database";
import { RollbackHandler } from "./types";

export const rollbackPlaceOrder: RollbackHandler = async (input) => {
  const { sagaId, stepId, payload } = input;
  getLogger("rollbackPlaceOrder").info(
    { sagaId, stepId, payload },
    "Triggering"
  );

  const id = payload.id; // TODO: Validate

  if (!id) {
    throw new Error("Missing payload.id");
  }

  const index = database["orders"].findIndex((order) => order.id === id);

  database.orders.splice(index, 1);
};
