import path from "path";
import fs from 'fs-extra';
import { doPrettier} from '../lints/prettier';
import { PKG_NAME } from "../utils/constant";
import { PkgConfig } from "../types";

export default async (options) => {
  const { cwd } = options;
  const readConfigFile = (pth: string): any => {
    const localPath = path.resolve(cwd, pth);
    return fs.existsSync(localPath) ? require(localPath) : {};
  }

  const pkgConfig: PkgConfig = readConfigFile(`${PKG_NAME}.config.js`);
  console.log("🚀 ~ pkgConfig:", pkgConfig)
  if (pkgConfig.enablePrettier !== false) {
    await doPrettier(options);
  }
}