import type { InitOptions } from '../types';
import path from 'path';
import fs from 'fs-extra';
import update from './update';

export default async (options: InitOptions) => {
  const cwd = options.cwd || process.cwd();
  const pkgPath = path.resolve(cwd, 'package.json');
  let pkg = fs.readJSONSync(pkgPath);
  console.log("🚀 ~ process.env.NODE_ENV:", process.env.NODE_ENV)
  const checkVersionUpdate = options.checkVersionUpdate || false;
  //版本检查
  if (checkVersionUpdate) {
    update(false);
  }
};
