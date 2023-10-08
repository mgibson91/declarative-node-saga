import { RollbackCommand } from "./command/contracts";

/** MOCK DB */
interface Database {
  orders: { id: string; productId: string; quantity: number; placedAt: Date }[];
  payments: { id: string; orderId: string; paymentProvider: string }[];
  subscriptions: { id: string; orderId: string; paymentId: string }[];
  rollbackOperations: {
    sagaId: string;
    stepId: string;
    command: RollbackCommand;
    payload: unknown;
  }[];
  processedEventIds: { id: string }[];
}

export const database: Database = {
  orders: [],
  payments: [],
  subscriptions: [],
  rollbackOperations: [],
  processedEventIds: [],
};
