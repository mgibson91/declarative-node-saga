// Create a global reference to the EventEmitter instance
import { EventEmitter } from "events";
import { getLogger } from "./logger";

const eventEmitter = new EventEmitter();

// Function to publish an event
function publishSagaStepComplete(eventData: any) {
  getLogger("queue").info({ eventData }, "Publishing saga event");
  eventEmitter.emit("saga-event", eventData);
}

// Function to publish an event
function publishSagaRollback(eventData: any) {
  getLogger("queue").info({ eventData }, "Publishing saga error");
  eventEmitter.emit("saga-rollback", eventData);
}

// Function to register event listeners
function registerSagaStepCompleteListener(callback: (eventData: any) => void) {
  eventEmitter.on("saga-event", callback);
}

// Function to register event listeners
function registerSagaRollbackListener(callback: (eventData: any) => void) {
  eventEmitter.on("saga-rollback", callback);
}

export const Queue = {
  publishSagaStepComplete,
  publishSagaRollback,
  registerSagaStepCompleteListener,
  registerSagaRollbackListener,
};
