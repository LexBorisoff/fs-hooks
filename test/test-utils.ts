import fs from 'node:fs';

export function deleteFolder(dirPath: string): void {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, {
      force: true,
      recursive: true,
    });
  }
}
