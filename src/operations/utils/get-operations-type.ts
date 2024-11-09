import { OPERATIONS_TYPE_SYM } from './operation.constants.js';
import type { OperationsTypeEnum } from './operations-type.enum.js';

// TODO: test
export function getOperationsType(
  value: unknown,
): OperationsTypeEnum | undefined {
  return (
    typeof value === 'object' &&
    Object.getOwnPropertyDescriptor(value, OPERATIONS_TYPE_SYM)?.value
  );
}
