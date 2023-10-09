import { getLogger } from "../../../logger";
import { HandlerInput } from "./types";

export async function sendEmail(input: HandlerInput<void>) {
  const { sagaId, stepId, stepInput } = input;
  getLogger("sendEmail").info({ sagaId, stepId, stepInput }, "Triggering");

  // No specific return value or rollback operation for email
  return {};
}
