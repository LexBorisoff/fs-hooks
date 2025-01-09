import fs from 'node:fs';

import { beforeAll, beforeEach, expect, it, suite, vi } from 'vitest';

import { FsHooks } from '@app/fs-hooks.js';
import { coreHooks } from '@core-hooks/core-hooks.js';
import { testSetup } from '@test-setup';

import { anyFunction } from './any-function.js';
import { TestEnum } from './test.enum.js';
import { NEW_DIR_NAME } from './use-dirs.js';
import {
  getUseFiles,
  NEW_FILE_DATA,
  NEW_FILE_NAME,
  type UseFilesFn,
} from './use-files.js';

import type { FileInfo } from './get-files-info.js';
import type { CoreHooks } from '@app-types/core-hooks.types.js';
import type { TreeInterface } from '@app-types/tree.types.js';

const { setup, testPath } = testSetup(TestEnum.UseFiles, import.meta);

const tree = {
  file1: 'File 1',
  file2: 'File 1\nFile 2',
  dir1: {},
  dir2: {
    file3: 'File 1\nFile 2\nFile 3',
    file4: 'File 1\nFile 2\nFile 3\nFile 4',
    dir3: {},
    dir4: {
      file5: 'File 1\nFile 2\nFile 3\nFile 4\nFile 5',
      file6: 'File 1\nFile 2\nFile 3\nFile 4\nFile 5\nFile 6',
    },
  },
} satisfies TreeInterface;

interface FileInterface extends FileInfo {
  fileHooks: CoreHooks['file'];
  dirHooks: CoreHooks['dir'];
}

suite('getUseFiles function', () => {
  beforeAll(() => setup());

  let fsHooks: FsHooks<typeof tree>;
  let files: FileInterface[];
  let useFiles: UseFilesFn;

  beforeEach(() => {
    fsHooks = new FsHooks(testPath, tree);
    useFiles = getUseFiles(fsHooks);
    const hooks = fsHooks.useHooks(coreHooks);

    files = [
      {
        fileHooks: hooks((root) => root.file1),
        dirHooks: hooks((root) => root),
        fileData: tree.file1,
        fileName: 'file1',
        pathDirs: [],
      },
      {
        fileHooks: hooks((root) => root.file2),
        dirHooks: hooks((root) => root),
        fileData: tree.file2,
        fileName: 'file2',
        pathDirs: [],
      },
      {
        fileHooks: hooks((root) => root.dir2.file3),
        dirHooks: hooks((root) => root.dir2),
        fileData: tree.dir2.file3,
        fileName: 'file3',
        pathDirs: ['dir2'],
      },
      {
        fileHooks: hooks((root) => root.dir2.file4),
        dirHooks: hooks((root) => root.dir2),
        fileData: tree.dir2.file4,
        fileName: 'file4',
        pathDirs: ['dir2'],
      },
      {
        fileHooks: hooks((root) => root.dir2.dir4.file5),
        dirHooks: hooks((root) => root.dir2.dir4),
        fileData: tree.dir2.dir4.file5,
        fileName: 'file5',
        pathDirs: ['dir2', 'dir4'],
      },
      {
        fileHooks: hooks((root) => root.dir2.dir4.file6),
        dirHooks: hooks((root) => root.dir2.dir4),
        fileData: tree.dir2.dir4.file6,
        fileName: 'file6',
        pathDirs: ['dir2', 'dir4'],
      },
    ];
  });

  it('should be a function', () => {
    expect(useFiles).toBeTypeOf('function');
  });

  it('should call the callback', () => {
    function treeFileParams(index: number): [object, FileInfo] {
      const { fileHooks, fileData, fileName, pathDirs } = files[index];
      const info: FileInfo = {
        fileName,
        fileData,
        pathDirs,
      };
      return [anyFunction(fileHooks), info];
    }

    /**
     * File created with fileCreate on tree directires
     */
    function createdFileParams1(index: number): [object, FileInfo] | [] {
      const { dirHooks, pathDirs } = files[index];
      const info: FileInfo = {
        fileData: NEW_FILE_DATA,
        fileName: NEW_FILE_NAME,
        pathDirs,
      };

      // create the tree directory
      const treeDir = dirHooks.getPath();
      fs.mkdirSync(treeDir, { recursive: true });

      // create the new file
      const createdFile = dirHooks.fileCreate(NEW_FILE_NAME, NEW_FILE_DATA);

      // delete the tree directory
      fs.rmSync(treeDir, {
        force: true,
        recursive: true,
      });

      return createdFile ? [anyFunction(createdFile), info] : [];
    }

    /**
     * File created with dirCreated + fileCreate combination
     */
    function createdFileParams2(index: number): [object, FileInfo] | [] {
      const { dirHooks, pathDirs } = files[index];
      const info: FileInfo = {
        fileData: NEW_FILE_DATA,
        fileName: NEW_FILE_NAME,
        pathDirs: pathDirs.concat(NEW_DIR_NAME),
      };

      // create the tree directory
      const treeDir = dirHooks.getPath();
      fs.mkdirSync(treeDir, { recursive: true });

      // create the new directory
      const createdDir = dirHooks.dirCreate(NEW_DIR_NAME);

      if (createdDir) {
        // create the new file
        const createdFile = createdDir.fileCreate(NEW_FILE_NAME, NEW_FILE_DATA);

        // delete the tree directory
        fs.rmSync(treeDir, {
          force: true,
          recursive: true,
        });

        return [anyFunction(createdFile || {}), info];
      }

      return [];
    }

    const cb = vi.fn();
    const numOfFiles = files.length;
    const callsPerFile = 3;

    useFiles(cb);
    expect(cb).toHaveBeenCalledTimes(numOfFiles * callsPerFile);

    let callNum = 1;
    Array.from({ length: numOfFiles }).forEach((_, i) => {
      expect(cb).toHaveBeenNthCalledWith(callNum++, ...treeFileParams(i));
      expect(cb).toHaveBeenNthCalledWith(callNum++, ...createdFileParams1(i));
      expect(cb).toHaveBeenNthCalledWith(callNum++, ...createdFileParams2(i));
    });
  });
});
