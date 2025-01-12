import { beforeEach, expect, it, suite } from 'vitest';

import { FsHooks } from '@app/fs-hooks.js';
import { testSetup } from '@test-setup';
import { getDirsInfo } from '@test-utils/get-dirs-info.js';

import { TestEnum } from './test.enum.js';

import type { TreeInterface } from '@app-types/tree.types.js';

const { testPath } = testSetup(TestEnum.GetDirsInfo, import.meta);

const tree = {
  file1: '',
  dir1: {
    file2: '',
    dir2: {
      file3: '',
      dir3: {
        file4: '',
      },
    },
  },
} satisfies TreeInterface;

suite('getDirsInfo function', () => {
  let fsHooks: FsHooks<typeof tree>;

  beforeEach(() => {
    fsHooks = new FsHooks(testPath, tree);
  });

  it('should return directories information array', () => {
    const dirs = getDirsInfo(fsHooks);

    const dirsInfo = [
      {
        children: ['file1', 'dir1'],
        pathDirs: [],
      },
      {
        children: ['file2', 'dir2'],
        pathDirs: ['dir1'],
      },
      {
        children: ['file3', 'dir3'],
        pathDirs: ['dir1', 'dir2'],
      },
      {
        children: ['file4'],
        pathDirs: ['dir1', 'dir2', 'dir3'],
      },
    ];

    expect(dirs).toEqual(dirsInfo);
  });
});
