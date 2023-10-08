export interface HandlerInput<T> {
  sagaId: string;
  stepId: string;
  sagaInput: unknown;
  stepInput: T;
  metadata?: Record<string, unknown>;
}
