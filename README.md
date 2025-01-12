# `fs-hooks`

![Build](https://img.shields.io/github/actions/workflow/status/LexBorisoff/fs-hooks/release.yml)
![Codecov](https://img.shields.io/codecov/c/gh/LexBorisoff/fs-hooks)
![NPM Version](https://img.shields.io/npm/v/fs-hooks)

This library allows you to work with the file system in Node.js by defining a tree of files and directories and a set of methods called hooks. A hook is a function that performs some action on a given file or directory from the tree, such as reading/writing to a file, creating/deleting a file/directory, checking if a file/directory exists, etc.

- [Installation](#installation)
- [Usage](#usage)
  - [Instantiation](#instantiation)
  - [Hooks registration](#hooks-registration)
  - [Using hooks](#using-hooks)
- [Tree](#tree)
  - [Creating the tree in the file system](#creating-the-tree-in-the-file-system)
- [Hooks](#hooks)
  - [Creating hooks](#creating-hooks)
  - [Target file and directory objects](#target-file-and-directory-objects)
  - [Utility methods](#utility-methods)
- [Core Hooks](#core-hooks)
  - [File Core Hooks](#file-core-hooks)
  - [Directory Core Hooks](#directory-core-hooks)

## Installation

```bash
npm install fs-hooks
```

```bash
pnpm add fs-hooks
```

```bash
yarn add fs-hooks
```

## Usage

### Instantiation

To use fs-hooks, you need to instantiate the `FsHooks` class by providing it two arguments:

- a root path string
- an object representing the tree of files and directories ([see here](#tree))

```typescript
import { FsHooks } from 'fs-hooks';

const fsHooks = new FsHooks('/path/to/tree/root', {
  file1: 'File 1 data',
  dir1: {
    file2: 'File 2 data',
  },
});
```

> ⚠️ It is important to create the tree in the file system before using hooks - [see here](#creating-the-tree-in-the-file-system).

### Hooks registration

Then you need to register hooks that you want to use. To register hooks, call the `useHooks` method on the created `FsHooks` instance. The method accepts an object that defines arbitrary file and directory hooks.

This library exports a pre-defined object with some common hooks, called `coreHooks` exported from `fs-hooks/core`.

```typescript
import { coreHooks } from 'fs-hooks/core';

/* statements */

const hooks = fsHooks.useHooks(coreHooks);
```

>
> ⚡ Learn more about hooks, how they work, and how to define them [here](#hooks).  
> ⚡ Learn about core hooks [here](#core-hooks).

### Using hooks

You are now able to work with the tree by using hooks. The returned value from calling the `useHooks` method is a function that accepts a callback whose only argument is the tree, and whose return value is a property of that tree that you want to work with (*"hook into"*).

```typescript
const file1 = hooks((root) => root.file1);
const dir1 = hooks((root) => root.dir1);

// file core hooks
file1.getPath();
file1.read();
file1.write('File 1 new data');
file1.clear();

// dir core hooks
dir1.getPath();
dir1.exists('file2');
dir1.dirCreate('new-dir');
dir1.dirDelete('new-dir');
dir1.fileRead('file2');
dir1.fileWrite('file2', 'File 2 new data');
dir1.fileClear('file2');
dir1.fileCreate('new-file');
dir1.fileDelete('new-file');
```

## Tree

The tree object represents a structure of files and directories that you will be working with via hooks. Each property key is the name of the corresponding file or directory, and its value determines whether the property is a file or a directory:

- A ***file*** is represented as a `string` whose value is the initial content of the file. This content will be written when calling the `createTree` function ([see here](#creating-the-tree-in-the-file-system)).
- A ***directory*** is represented as an object of type `TreeInterface` and contains files and/or other directories (the tree itself is also such a directory).

For example:

```typescript
const fsHooks = new FsHooks('/path/to/tree/root', {
  file1: 'File 1 data',
  'file2.html': getHtmlContent(), // returns a string
  'file3.css': getCssContent(), // returns a string
  dir1: {}, // empty directory
  dir2: {
    file5: 'File 5 data',
    'file6.js': getJsContent(), // returns a string
    dir3: {
      file7: 'File 7 data',
      'file8.sh': getBashContent(), // returns a string
    },
  },
});
```

If you are creating a standalone tree object and want to have type safety, use the `TreeInterface` type exported from `fs-hooks`:

```typescript
import { FsHooks, type TreeInterface } from 'fs-hooks';

const tree = {
  /* tree definition */
} satisfies TreeInterface;

const fsHooks = new FsHooks('/path/to/tree/root', tree);
```

> ⚠️ It is important to use the `satisfies` keyword instead of annotating the variable, otherwise you will not get the TypeScript autocompletion features when using the hooks! Make sure your TypeScript version supports it.

### Creating the tree in the file system

Before you can start interacting with the tree, it is important that you create it in the file system. To help you with that, this library exports a function called `createTree` that accepts an `FsHooks` instance:

```typescript
import { createTree } from 'fs-hooks';
// import an FsHooks object from your source files, e.g.
import fsHooks from './my-app.js';

createTree(fsHook);
```

> ⚠️ This should be done only once, for example as part of a post-install script of your package or in some other way depending on your node.js application.

The `createTree` function traverses through the tree properties creating files and directories that do not currently exist, and returns an array of `CreateTreeError` errors.

```typescript
function createTree(fsHooks: FsHooks<TreeInterface>): CreateTreeError[]
```

## Hooks

A hook is a function that performs some action on a given file or directory from the tree. You can create as many or as few hooks as you'd like for the same tree by registering them with the `useHooks` method on an `FsHooks` instance.

The `useHooks` method accepts an object that has 2 properties:

- `file` - a function that takes a `targetFile` object of type `FileTargetInterface` and returns an object with file hooks.
- `dir` - a function that takes a `targetDir` object of type `DirTargetInterface` and returns an object with directory hooks.

```typescript
// describes targetFile
interface FileTargetInterface {
  type: 'file';
  data: string;
  path: string;
}

// describes targetDir
export interface DirTargetInterface<Tree extends TreeInterface> {
  type: 'dir';
  children: ObjectTreeType<Tree>;
  path: string;
}

export type ObjectTreeType<Tree extends TreeInterface> = {
  [key in keyof Tree]: Tree[key] extends string
    ? FileTargetInterface
    : Tree[key] extends TreeInterface
      ? DirTargetInterface<Tree[key]>
      : never;
};

```

### Creating hooks

Here's a small example of how to create your own hooks:

```typescript
import fs from 'node:fs';
import path from 'node:path';

const fsHooks = new FsHooks('/root/path', {
  dir1: {
    dir2: {
      file1: 'File 1 data',
    },
  },
});

const hooks = fsHooks.useHooks({
  file: (targetFile) => ({
    read() {
      return fs.readFileSync(targetFile.path, { encoding: 'utf-8' });
    },
    /* other file hooks */
  }),
  dir: (targetDir) => ({
    readFile(fileName: string) {
      const filePath = path.resolve(targetDir.path, fileName);
      return fs.readFileSync(filePath, { encoding: 'utf-8' });
    },
    /* other directory hooks */
  }),
});
```

### Target file and directory objects

The `file` method accepts a `targetFile` argument of type `FileTargetInterface` and the `dir` method accepts a `targetDir` argument of type `DirTargetInterface`. These arguments are objects that *respresent* the selected file or directory from the tree when you call the `hooks` function (returned from `useHooks`). Following the above example, when calling `hooks` like this:

```typescript
const file1 = hooks((root) => root.dir1.dir2.file1);
const dir1 = hooks((root) => root.dir1);
```

the `targetFile` would have the following value:

```typescript
{
  type: 'file',
  path: '/root/path/dir1/dir2/file1',
  data: 'File 1 data',
}
```

and `targetDir` would be as follows:

```typescript
{
  type: 'dir',
  path: '/root/path/dir1',
  children: {
    dir2: {
      type: 'dir',
      path: '/root/path/dir1/dir2',
      children: {
        type: 'file',
        path: '/root/path/dir1/dir2/file1',
        data: 'File 1 data',        
      }
    }
  },
}
```

### Utility methods

The `FsHooks` class has static utility methods that help you create your custom file and directory hooks that can be later provided to the `useHooks` method. This could be useful when you want to export common hooks, or if some of your hooks need to return the hooks themselves, for example when creating a new file or directory.

```typescript
import fs from 'node:fs';
import path from 'node:path';
import { FsHooks } from 'fs-hooks';

export const fileHooks = FsHooks.fileHooks((targetFile) => ({
  read() {
    return fs.readFileSync(targetFile.path, { encoding: 'utf-8' });
  }
  /* other file hooks */
}));


export const dirHooks = FsHooks.dirHooks((targetDir) => ({
  createFile(fileName: string, data = '') {
    const filePath = path.resolve(targetDir.path, fileName);
    fs.writeFileSync(filePath, data);

    // 👇 notice that it calls fileHooks
    return fileHooks({
      type: 'file',
      path: filePath,
      data,
    });
  },
  createDir(dirName: string) {
    const dirPath = path.resolve(targetDir.path, dirName);
    fs.mkdirSync(dirPath);

    // 👇 notice that it calls dirHooks
    return dirHooks({
      type: 'dir',
      path: dirPath,
      children: {},
    });
  },
  /* other directory hooks */
}));
```

This allows for the following scenario:

```typescript
import { FsHooks } from 'fs-hooks';

const fileHooks = FsHooks.fileHooks((targetFile) => ({
  /* file hooks */
}));

const dirHooks = FsHooks.dirHooks((targetDir) => ({
  /* directory hooks */
}));

const fsHooks = new FsHooks('/path/to/tree/root', {
  dir1: {
    dir2: {
      file1: 'File 1 data',
    },
  },
});

const hooks = fsHooks.useHooks({
  file: fileHooks,
  dir: dirHooks,
});

const root = hooks((root) => root);
const newFile1 = root.createFile('new-file1', 'New file 1 data');
const data1 = newFile1.read(); // New file 1 data

const dir1 = hooks((root) => root.dir1);
const newDir1 = dir1.createDir('new-dir1');
const newDir2 = newDir1.createDir('new-dir2');
const newDir3 = newDir2.createDir('new-dir3');
const newFile2 = newDir3.createFile('new-file2', 'New file 2 data');
const data2 = newFile2.read(); // New file 2 data
```

> 💡 The above example is how core hooks are built under the hood.

## Core Hooks

The library exports a set of common hooks called `coreHooks` from `fs-hooks/core` that can be provided to the `useHooks` method.

```typescript
import { FsHooks } from 'fs-hooks';
import { coreHooks } from 'fs-hooks/core';

const fsHooks = new FsHooks('/path/to/tree/root', {
  /* tree definition */
});

const hooks = fsHooks.useHooks(coreHooks);
```

### File Core Hooks

### `getPath`

Returns the path of the target file.

#### *Definition*

```typescript
getPath(): string
```

#### *Example*

```typescript
const file = hooks((root) => root.file)
const filePath = file.getPath();
```

### `read`

Reads the content of the target file. Returns the file data or null if the file cannot be read.

#### *Definition*

```typescript
read(): string | null
```

#### *Example*

```typescript
const file = hooks((root) => root.file)
const fileData = file.read();
```

### `write`

Writes data to the target file.

#### *Definition*

```typescript
write(data: string): void
```

#### *Example*

```typescript
const file = hooks((root) => root.file)
file.write('New file data');
```

### `clear`

Clears the content of the target file.

#### *Definition*

```typescript
clear(): void
```

#### *Example*

```typescript
const file = hooks((root) => root.file)
file.clear();
```

### Directory Core Hooks

### `getPath`

Returns the path of the target directory.

#### *Definition*

```typescript
getPath(): string
```

#### *Example*

```typescript
const dir = hooks((root) => root)
const dirPath = dir.getPath();
```

### `exists`

Checks if a file or directory exists inside the target directory.

#### *Definition*

```typescript
exists(name: string): boolean
```

#### *Example*

```typescript
const dir = hooks((root) => root)
const fileExists = dir.exists('some-file');
const dirExists = dir.exists('some-dir');
```

### `dirCreate`

Creates a new directory inside the target directory. Returns the created directory hooks.

#### *Definition*

```typescript
dirCreate(dirName: string, recursive: boolean = false): DirHooks
```

#### *Example*

```typescript
const dir = hooks((root) => root)
const newDir = dir.dirCreate('new-dir');

// you can access all the directory hooks on the newDir
newDir.getPath();

// even create another new directory!
const anotherDir = newDir.createDir('foo');
```

> In the above example, `newDir` has all the directory hooks just like accessing a tree directory with the `hooks` function.

#### *Creating a nested directory*

To create a nested directory, provide the second argument with the value of `true`:

```typescript
const dir = hooks((root) => root)
const newDir = dir.dirCreate('nested/new-dir', true);
```

### `dirDelete`

Deletes a directory inside the target directory.

#### *Definition*

```typescript
dirDelete(dirName: string): void
```

#### *Example*

```typescript
const dir = hooks((root) => root)
dir.dirDelete('some-dir');
```

### `fileRead`

Reads the content of a file inside the target directory. Returns the file data or null if the file cannot be read.

#### *Definition*

```typescript
fileRead(fileName: string): string | null
```

#### *Example*

```typescript
const dir = hooks((root) => root)
const fileData = dir.fileRead('some-file');
```

### `fileWrite`

Writes new data to a file inside the target directory.

#### *Definition*

```typescript
fileWrite(fileName: string, fileData: string): void
```

#### *Example*

```typescript
const dir = hooks((root) => root)
dir.fileWrite('some-file', 'some file data');
```

### `fileClear`

Clears the content of a file inside the target directory.

#### *Definition*

```typescript
fileClear(fileName: string): void
```

#### *Example*

```typescript
const dir = hooks((root) => root)
dir.fileClear('some-file');
```

### `fileCreate`

Creates a new file inside the target directory. Returns the created file hooks.

#### *Definition*

```typescript
fileCreate(fileName: string, data: string = ''): FileHooks
```

#### *Example*

```typescript
const dir = hooks((root) => root)
const newFile = dir.fileCreate('new-file', 'new file data');

// you can access all the file hooks on the newFile
newFile.getPath();
newFile.read();
newFile.write('updated file data');
newFile.clear();
```

> In the above example, `newFile` has all the file hooks just like accessing a tree file with the `hooks` function.

### `fileDelete`

Deletes a file inside the target directory.

#### *Definition*

```typescript
fileDelete(fileName: string): void
```

#### *Example*

```typescript
const dir = hooks((root) => root)
dir.fileDelete('some-file');
```
