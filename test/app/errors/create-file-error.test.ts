import { beforeEach, expect, it, suite } from 'vitest';
import { CreateFileError } from '../../../src/errors/create-file.error.js';
import { testSetup } from '../../test-setup.js';

const { testPath } = testSetup('create-file-error', import.meta);

suite('CreateFileError class', () => {
  let fileError1: CreateFileError;
  let fileError2: CreateFileError;
  let dirError1: CreateFileError;
  let dirError2: CreateFileError;
  const reason = 'testing';

  beforeEach(() => {
    fileError1 = new CreateFileError('file', testPath);
    fileError2 = new CreateFileError('file', testPath, reason);
    dirError1 = new CreateFileError('dir', testPath);
    dirError2 = new CreateFileError('dir', testPath, reason);
  });

  it('should create a CreateFileError instance', () => {
    [fileError1, fileError2, dirError1, dirError2].forEach((error) => {
      expect(error).toBeInstanceOf(CreateFileError);
    });
  });

  it('should have correct error type', () => {
    [fileError1, fileError2].forEach((error) => {
      expect(error.type).toBe('file');
    });
    [dirError1, dirError2].forEach((error) => {
      expect(error.type).toBe('dir');
    });
  });

  it('should have correct path', () => {
    [fileError1, fileError2, dirError1, dirError2].forEach((error) => {
      expect(error.path).toBe(testPath);
    });
  });

  it('should have correct error message', () => {
    expect(fileError1.message).toBe('Cannot create file');
    expect(fileError2.message).toBe(`Cannot create file: ${reason}`);
    expect(dirError1.message).toBe('Cannot create directory');
    expect(dirError2.message).toBe(`Cannot create directory: ${reason}`);
  });
});
