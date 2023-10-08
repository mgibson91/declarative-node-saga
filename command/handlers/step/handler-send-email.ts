import { executeStep } from "../../../execute-step";
import { getLogger } from "../../../logger";
import { HandlerInput } from "./types";

export async function sendEmail(input: HandlerInput<void>) {
  await executeStep({
    ...input,
    handler: ({ sagaId, stepId, stepInput }: HandlerInput<void>) => {
      getLogger("sendEmail").info({ sagaId, stepId, stepInput }, "Triggering");

      // No specific return value or rollback operation for email
      return {};
    },
  });
}
