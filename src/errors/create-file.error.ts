export class CreateFileError extends Error {
  #path: string;

  #type: 'file' | 'dir';

  constructor(type: 'file' | 'dir', path: string, reason?: string) {
    const message = `Cannot create ${type}${reason != null ? `: ${reason}` : ''}`;
    super(message);
    this.#type = type;
    this.#path = path;
  }

  get path(): string {
    return this.#path;
  }

  get type(): string {
    return this.#type;
  }
}
