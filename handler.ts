import { getLogger } from "./logger";
import { v4 as uuid } from "uuid";
import { executeStep } from "./execute-step";
import { database } from "./database";
import { Command, RollbackCommand } from "./command/contracts";

// export function getStepHandler(
//   eventHandlerType: Command
// ): (input: HandlerInput<any>) => Promise<any> {
//   switch (eventHandlerType) {
//     case Command.PlaceOrder:
//       return placeOrder;
//     case Command.SendEmail:
//       return sendEmail;
//     case Command.CreateSubscription:
//       return createSubscription;
//     case Command.TakePayment:
//       return takePayment;
//     case Command.TriggerError:
//       return triggerError;
//     default:
//       throw new Error(`Unknown event handler type: ${eventHandlerType}`);
//   }
// }

// interface RollbackStepInput {
//   sagaId: string;
//   stepId: string;
//   payload: any;
// }

// export type RollbackHandler = (input: RollbackStepInput) => Promise<void>;
//
// export function getRollbackHandler(
//   eventHandlerType: RollbackCommand
// ): RollbackHandler {
//   switch (eventHandlerType) {
//     case RollbackCommand.PlaceOrder:
//       return rollbackPlaceOrder;
//     case RollbackCommand.CreateSubscription:
//       return rollbackCreateSubscription;
//     case RollbackCommand.TakePayment:
//       return rollbackTakePayment;
//     default:
//       throw new Error(`Unknown event handler type: ${eventHandlerType}`);
//   }
// }

// interface HandlerInput<T> {
//   sagaId: string;
//   stepId: string;
//   sagaInput: unknown;
//   stepInput: T;
//   metadata?: Record<string, unknown>;
// }

// interface RollbackPlaceOrderInput {
//   id: string;
//   quantity: number;
//   placedAt: Date;
// }

// export async function placeOrder(
//   input: HandlerInput<{ productId: string; quantity: number }>
// ) {
//   await executeStep({
//     ...input,
//     handler: ({
//       sagaId,
//       stepId,
//       stepInput,
//     }: HandlerInput<{ productId: string; quantity: number }>) => {
//       getLogger("placeOrder").info({ sagaId, stepId, stepInput }, "placeOrder");
//
//       const id = uuid();
//       const productId = stepInput.productId;
//       const timestamp = new Date();
//
//       database["orders"].push({
//         id,
//         productId,
//         quantity: stepInput.quantity,
//         placedAt: timestamp,
//       });
//
//       database["rollbackOperations"].push({
//         sagaId,
//         stepId,
//         command: RollbackCommand.PlaceOrder,
//         payload: {
//           id,
//           quantity: stepInput.quantity,
//           placedAt: timestamp,
//         } satisfies RollbackPlaceOrderInput,
//       });
//
//       return { orderId: id };
//     },
//   });
// }

// export async function takePayment(input: HandlerInput<{ orderId: string }>) {
//   await executeStep({
//     ...input,
//     handler: ({
//       sagaId,
//       stepId,
//       stepInput,
//       metadata,
//     }: HandlerInput<{ orderId: string }>) => {
//       getLogger("takePayment").info(
//         { sagaId, stepId, stepInput, metadata },
//         "takePayment"
//       );
//
//       const paymentProvider = metadata?.paymentProvider as string | undefined;
//       if (!paymentProvider) {
//         throw new Error("Missing metadata.paymentProvider");
//       }
//
//       const orderId = stepInput.orderId;
//       const id = uuid();
//
//       database["payments"].push({
//         id,
//         orderId,
//         paymentProvider,
//       });
//
//       database["rollbackOperations"].push({
//         sagaId,
//         stepId,
//         command: RollbackCommand.TakePayment,
//         payload: { id },
//       });
//
//       const deduplicationId = `${Command.TakePayment}-${id}`;
//       database["processedEventIds"].push({
//         id: deduplicationId,
//       });
//
//       return { orderId, paymentId: id };
//     },
//   });
// }

// export async function createSubscription(
//   input: HandlerInput<{ orderId: string; paymentId: string }>
// ) {
//   await executeStep({
//     ...input,
//     handler: ({
//       sagaId,
//       stepId,
//       stepInput,
//     }: HandlerInput<{ orderId: string; paymentId: string }>) => {
//       getLogger("createSubscription").info(
//         { sagaId, stepId, stepInput },
//         "Triggering"
//       );
//
//       const id = uuid();
//
//       database["subscriptions"].push({
//         id,
//         orderId: stepInput.orderId,
//         paymentId: stepInput.paymentId,
//       });
//
//       database["rollbackOperations"].push({
//         sagaId,
//         stepId,
//         command: RollbackCommand.CreateSubscription,
//         payload: { id },
//       });
//
//       return { subscriptionId: id };
//     },
//   });
// }

// export async function sendEmail(input: HandlerInput<void>) {
//   await executeStep({
//     ...input,
//     handler: ({ sagaId, stepId, stepInput }: HandlerInput<void>) => {
//       getLogger("sendEmail").info({ sagaId, stepId, stepInput }, "Triggering");
//
//       // No specific return value or rollback operation for email
//       return {};
//     },
//   });
// }

// export async function triggerError(input: HandlerInput<void>) {
//   await executeStep({
//     ...input,
//     handler: ({ sagaId, stepId, stepInput }: HandlerInput<void>) => {
//       getLogger("triggerError").info({ sagaId, stepId }, "Triggering");
//
//       throw new Error("Triggered error");
//     },
//   });
// }

// export const rollbackCreateSubscription: RollbackHandler = async (input) => {
//   const { sagaId, stepId, payload } = input;
//   getLogger("rollbackCreateSubscription").info(
//     { sagaId, stepId, payload },
//     "Triggering"
//   );
//
//   const id = payload.id; // TODO: Validate
//
//   const index = database["subscriptions"].findIndex(
//     (subscription) => subscription.id === id
//   );
//
//   database.subscriptions.splice(index, 1);
// };

// export const rollbackTakePayment: RollbackHandler = async (input) => {
//   const { sagaId, stepId, payload } = input;
//   getLogger("rollbackTakePayment").info(
//     { sagaId, stepId, payload },
//     "Triggering"
//   );
//
//   const id = payload.id; // TODO: Validate
//
//   const index = database["payments"].findIndex((payment) => payment.id === id);
//
//   database.payments.splice(index, 1);
// };

// export const rollbackPlaceOrder: RollbackHandler = async (input) => {
//   const { sagaId, stepId, payload } = input;
//   getLogger("rollbackPlaceOrder").info(
//     { sagaId, stepId, payload },
//     "Triggering"
//   );
//
//   const id = payload.id; // TODO: Validate
//
//   if (!id) {
//     throw new Error("Missing payload.id");
//   }
//
//   const index = database["orders"].findIndex((order) => order.id === id);
//
//   database.orders.splice(index, 1);
// };
