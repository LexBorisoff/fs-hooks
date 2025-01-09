import { beforeEach, expect, it, suite } from 'vitest';

import { CreateTreeError } from '@app/errors/create-tree.error.js';
import { testSetup } from '@test-setup';

const { testPath } = testSetup('create-file-error', import.meta);

suite('CreateTreeError class', () => {
  let fileError1: CreateTreeError;
  let fileError2: CreateTreeError;
  let fileError3: CreateTreeError;
  let dirError1: CreateTreeError;
  let dirError2: CreateTreeError;
  let dirError3: CreateTreeError;

  const testReason = 'testing';
  let fileReason: string;
  let dirReason: string;

  beforeEach(() => {
    fileError1 = new CreateTreeError('file', testPath);
    fileError2 = new CreateTreeError('file', testPath, testReason);
    fileError3 = new CreateTreeError(
      'file',
      testPath,
      ({ pathExistsAsDir }) => {
        fileReason = pathExistsAsDir;
        return pathExistsAsDir;
      },
    );
    dirError1 = new CreateTreeError('dir', testPath);
    dirError2 = new CreateTreeError('dir', testPath, testReason);
    dirError3 = new CreateTreeError('dir', testPath, ({ pathExistsAsFile }) => {
      dirReason = pathExistsAsFile;
      return pathExistsAsFile;
    });
  });

  it('should create a CreateTreeError instance', () => {
    [
      fileError1,
      fileError2,
      fileError3,
      dirError1,
      dirError2,
      dirError3,
    ].forEach((error) => {
      expect(error).toBeInstanceOf(CreateTreeError);
    });
  });

  it('should have correct error type', () => {
    [fileError1, fileError2, fileError3].forEach((error) => {
      expect(error.type).toBe('file');
    });
    [dirError1, dirError2, dirError3].forEach((error) => {
      expect(error.type).toBe('dir');
    });
  });

  it('should have correct path', () => {
    [
      fileError1,
      fileError2,
      fileError3,
      dirError1,
      dirError2,
      dirError3,
    ].forEach((error) => {
      expect(error.path).toBe(testPath);
    });
  });

  it('should have correct error message', () => {
    expect(fileError1.message).toBe('Cannot create file');
    expect(fileError2.message).toBe(`Cannot create file: ${testReason}`);
    expect(fileError3.message).toBe(`Cannot create file: ${fileReason}`);
    expect(dirError1.message).toBe('Cannot create directory');
    expect(dirError2.message).toBe(`Cannot create directory: ${testReason}`);
    expect(dirError3.message).toBe(`Cannot create directory: ${dirReason}`);
  });
});
