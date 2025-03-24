export class NoContextDataProvidedError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'NoContextDataProvidedError';
  }
}
