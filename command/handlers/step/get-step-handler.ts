import { Command } from "../../contracts";
import { HandlerInput } from "./types";
import {
  placeOrder,
  sendEmail,
  createSubscription,
  takePayment,
  triggerError,
} from ".";

export function getStepHandler(
  eventHandlerType: Command
): (input: HandlerInput<any>) => Promise<any> {
  switch (eventHandlerType) {
    case Command.PlaceOrder:
      return placeOrder;
    case Command.SendEmail:
      return sendEmail;
    case Command.CreateSubscription:
      return createSubscription;
    case Command.TakePayment:
      return takePayment;
    case Command.TriggerError:
      return triggerError;
    default:
      throw new Error(`Unknown event handler type: ${eventHandlerType}`);
  }
}
