import path from 'path';
import fs from 'fs-extra';

const pkg: Record<string, any> = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'),
);

//包名
export const PKG_NAME: string = pkg.name;
//包的版本
export const PKG_VERSION: string = pkg.version;