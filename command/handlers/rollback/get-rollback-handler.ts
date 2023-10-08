import { RollbackCommand } from "../../contracts";
import { RollbackHandler } from "./types";
import {
  rollbackPlaceOrder,
  rollbackCreateSubscription,
  rollbackTakePayment,
} from ".";

export function getRollbackHandler(
  eventHandlerType: RollbackCommand
): RollbackHandler {
  switch (eventHandlerType) {
    case RollbackCommand.PlaceOrder:
      return rollbackPlaceOrder;
    case RollbackCommand.CreateSubscription:
      return rollbackCreateSubscription;
    case RollbackCommand.TakePayment:
      return rollbackTakePayment;
    default:
      throw new Error(`Unknown event handler type: ${eventHandlerType}`);
  }
}
