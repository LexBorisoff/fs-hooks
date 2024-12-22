import { OPERATIONS_TYPE_SYM } from './constants.js';

import type { OperationsTypeEnum } from './operations-type.enum.js';

export function getOperationsType(
  value: unknown,
): OperationsTypeEnum | undefined {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }

  return Object.getOwnPropertyDescriptor(value, OPERATIONS_TYPE_SYM)?.value;
}
