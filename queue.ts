import { EventEmitter } from "events";
import { getLogger } from "./logger";

const eventEmitter = new EventEmitter();

function publishSagaStepComplete(eventData: any) {
  getLogger("queue").info({ eventData }, "Publishing saga step complete");
  eventEmitter.emit("saga-step-complete", eventData);
}

function publishSagaRollback(eventData: any) {
  getLogger("queue").info({ eventData }, "Publishing saga rollback");
  eventEmitter.emit("saga-rollback", eventData);
}

function registerSagaStepCompleteListener(callback: (eventData: any) => void) {
  eventEmitter.on("saga-step-complete", callback);
}

function registerSagaRollbackListener(callback: (eventData: any) => void) {
  eventEmitter.on("saga-rollback", callback);
}

export const Queue = {
  publishSagaStepComplete,
  publishSagaRollback,
  registerSagaStepCompleteListener,
  registerSagaRollbackListener,
};
