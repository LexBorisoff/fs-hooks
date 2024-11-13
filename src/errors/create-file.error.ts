export class CreateFileError extends Error {
  #path: string;

  #type: 'file' | 'dir';

  constructor(type: 'file' | 'dir', path: string, reason?: string) {
    const fileType = type === 'dir' ? 'directory' : type;
    const message = `Cannot create ${fileType}${reason != null ? `: ${reason}` : ''}`;
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
