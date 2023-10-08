// Specific rollback handlers as sometimes you want to trigger these as positive actions
export enum RollbackCommand {
  PlaceOrder = "PlaceOrder",
  CreateSubscription = "CreateSubscription",
  TakePayment = "TakePayment",
}
