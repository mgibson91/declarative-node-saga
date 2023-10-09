## Declarative Node Sagas

### Idea
- Declarative sequence of async steps
- No explicit event names, inferred from saga & step IDs
- Can be hosted in any long running context (serverless, container or VM)
- Saga step complete & rollback handler async

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

#### *Scalability note*
In this base example, the saga event handler `main.ts` is also executing the handlers. In order to scale, you may want to:
- Ensure the saga event handler can scale itself e.g. scalable serverless, pool of handlers in same service
- Publish commands to corresponding handle queue(s) and have a pool of workers to handle the events
  - The important thing is that the saga success / fail events are published correctly from somewhere