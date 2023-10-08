export interface RollbackStepInput {
  sagaId: string;
  stepId: string;
  payload: any;
}

export type RollbackHandler = (input: RollbackStepInput) => Promise<void>;
