## Declarative Node Sagas

### Idea
- Declarative sequence of async steps
- No explicit event names, inferred from saga & step IDs
- Can be hosted in any long running context (serverless, container or VM)
- Saga step complete & rollback handlers trigger the next async steps.
- All that is required is that those steps at some point publish a `saga-step-complete` or `saga-rollback` event 

### Benefits
- Highly modular
- Composable, reusable
- Enforces common patterns
- Easier to test in isolation

### Usage
- `yarn install`
- `yarn start`

### Considerations
- Row level locking should be used with transactions to minimise transaction overhead
- Deduplication of events may be required if not idempotent
- Handlers are calling `executeStep` themselves which publishes the saga events. This is to model a distributed
  system with different services publishing events. If using same tech, the main processing logic could wrap the handler 
  call in `executeStep` once instead of each handler calling it

## Planned updates
- [ ] Add Zod schemas to validate rollbacks
- [ ] Add optional input mapping logic to saga steps -
  - e.g. map previous `{ id }` to `{ orderId }` before passing to `TakePayment` step
  - Currently the `CreateOrder` step explicitly returns `{ orderId }` for easy consumption by following step
