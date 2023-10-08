import { executeStep } from "../../../execute-step";
import { getLogger } from "../../../logger";
import { HandlerInput } from "./types";

export async function triggerError(input: HandlerInput<void>) {
  await executeStep({
    ...input,
    handler: ({ sagaId, stepId, stepInput }: HandlerInput<void>) => {
      getLogger("triggerError").info({ sagaId, stepId }, "Triggering");

      throw new Error("Triggered error");
    },
  });
}
