import type { FileStructure } from '../types/file-structure.types.js';
import type { OperationStructure } from './types/operations.types.js';
import { operationsMapper } from './mappers/operations.mapper.js';
import { pathsMapper } from './mappers/paths.mapper.js';

export function createOperations<S extends FileStructure>(
  appName: string,
  fileStructure: S,
): OperationStructure<S> {
  return operationsMapper(pathsMapper(appName, fileStructure));
}

const app = createOperations('pm-cli', {
  bin: {
    type: 'dir',
    children: {
      foo: {
        type: 'dir',
        children: {
          bar: {
            type: 'file',
          },
        },
      },
    },
  },
});

app.bin.foo.bar.write('npm run build');
const barData = app.bin.foo.bar.read();
console.log('barData >>>', barData);
