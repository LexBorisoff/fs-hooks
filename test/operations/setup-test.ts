import { handleTestDir } from '../handle-test-dir.js';

interface SetupTestInterface {
  testRoot: string;
  handleCreateDir: () => void;
  handleDeleteDir: () => void;
}

export function setupTest(dirName: string): SetupTestInterface {
  const {
    testRoot: suiteRoot,
    createTestDir: createSuiteDir,
    deleteTestDir: deleteSuiteDir,
  } = handleTestDir('operations');

  const { testRoot, createTestDir } = handleTestDir(dirName, suiteRoot);

  return {
    testRoot,
    handleCreateDir(): void {
      createSuiteDir();
      createTestDir();
    },
    handleDeleteDir(): void {
      deleteSuiteDir();
    },
  };
}
