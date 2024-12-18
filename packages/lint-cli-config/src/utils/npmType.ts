import { sync as commandExistsSync } from 'command-exists';

type NpmType = 'pnpm' | 'npm';
const getNpmType = () :NpmType => {
  if (commandExistsSync('pnpm')) return 'pnpm';
  return 'npm';
}
export default getNpmType;
