export class MissingContextError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'MissingContextError';
  }
}
