import * as os from 'node:os';
import * as fs from 'node:fs';
import * as path from 'node:path';

export function getAppHomedir(appName: string): string {
  if (appName === '') {
    throw new Error('Empty app name');
  }

  const homedir = os.homedir();
  let directory: string | undefined;
  const { platform } = process;

  switch (platform) {
    case 'win32': {
      directory = path.join(homedir, 'AppData', 'Roaming');
      break;
    }
    case 'darwin': {
      directory = path.join(homedir, 'Library', 'Application Support');
      break;
    }
    case 'linux': {
      const configPath = path.join(homedir, '.config');
      directory = fs.existsSync(configPath) ? configPath : homedir;
      break;
    }
    default: {
      directory = homedir;
      break;
    }
  }

  if (!fs.existsSync(directory)) {
    directory = homedir;
  }

  return path.join(directory, 'lexjs', appName);
}
