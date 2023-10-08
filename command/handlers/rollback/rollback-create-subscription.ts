import { getLogger } from "../../../logger";
import { database } from "../../../database";
import { RollbackHandler } from "./types";

export const rollbackCreateSubscription: RollbackHandler = async (input) => {
  const { sagaId, stepId, payload } = input;
  getLogger("rollbackCreateSubscription").info(
    { sagaId, stepId, payload },
    "Triggering"
  );

  const id = payload.id; // TODO: Validate

  const index = database["subscriptions"].findIndex(
    (subscription) => subscription.id === id
  );

  database.subscriptions.splice(index, 1);
};
