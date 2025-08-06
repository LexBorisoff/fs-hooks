function isStringOrArrayBufferView(
  value: unknown,
): value is string | NodeJS.ArrayBufferView {
  return typeof value === 'string' || ArrayBuffer.isView(value);
}

export function getFileData(data: unknown): string | NodeJS.ArrayBufferView {
  return isStringOrArrayBufferView(data) ? data : JSON.stringify(data);
}
