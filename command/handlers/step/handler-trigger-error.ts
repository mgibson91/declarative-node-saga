import { getLogger } from "../../../logger";
import { HandlerInput } from "./types";

export async function triggerError(input: HandlerInput<void>) {
  const { sagaId, stepId } = input;
  getLogger("triggerError").info({ sagaId, stepId }, "Triggering");

  throw new Error("Triggered error");
}
