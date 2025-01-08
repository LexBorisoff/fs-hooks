import { beforeEach, expect, it, suite } from 'vitest';

import { CreateFileError } from '@app/errors/create-file.error.js';
import { testSetup } from '@test-setup';

const { testPath } = testSetup('create-file-error', import.meta);

suite('CreateFileError class', () => {
  let fileError1: CreateFileError;
  let fileError2: CreateFileError;
  let fileError3: CreateFileError;
  let dirError1: CreateFileError;
  let dirError2: CreateFileError;
  let dirError3: CreateFileError;

  const testReason = 'testing';
  let fileReason: string;
  let dirReason: string;

  beforeEach(() => {
    fileError1 = new CreateFileError('file', testPath);
    fileError2 = new CreateFileError('file', testPath, testReason);
    fileError3 = new CreateFileError(
      'file',
      testPath,
      ({ pathExistsAsDir }) => {
        fileReason = pathExistsAsDir;
        return pathExistsAsDir;
      },
    );
    dirError1 = new CreateFileError('dir', testPath);
    dirError2 = new CreateFileError('dir', testPath, testReason);
    dirError3 = new CreateFileError('dir', testPath, ({ pathExistsAsFile }) => {
      dirReason = pathExistsAsFile;
      return pathExistsAsFile;
    });
  });

  it('should create a CreateFileError instance', () => {
    [
      fileError1,
      fileError2,
      fileError3,
      dirError1,
      dirError2,
      dirError3,
    ].forEach((error) => {
      expect(error).toBeInstanceOf(CreateFileError);
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
