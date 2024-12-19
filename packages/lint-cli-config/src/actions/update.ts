import ora from 'ora';
import { execSync } from 'child_process';
import getNpmType from '../utils/npmType';
import { PKG_NAME, PKG_VERSION } from '../utils/constant';
import log from '../utils/log';

//有更新版本，返回版本号,否则返回空
const getUpdateVersion = (): string | null=> {
  const npmType = getNpmType();
  console.log("🚀 ~ getUpdateVersion ~ npmType:", npmType)
  const latestVersion = execSync(`${npmType} view ${PKG_NAME} version`).toString('utf-8').trim();
  if (latestVersion === PKG_VERSION) return null;
  const pkgVersionArr = PKG_VERSION.split('.');
  console.log("🚀 ~ updateVersion ~ pkgVersionArr:", pkgVersionArr)
  const latestVersionArr = latestVersion.split('.');
  for (let i = 0; i < pkgVersionArr.length; i++) {
    if (Number(latestVersionArr[i]) > Number(pkgVersionArr[i])) {
      return latestVersion;
    }
  }
  return null;
}

export default ({install}) => {
  const checking = ora('正在检查最新版本...');
  checking.start();

  const npmType = getNpmType();
  const updateVersion = getUpdateVersion();
  checking.stop();
  if (updateVersion && install) {
    //版本更新，且安装依赖
    const updateing = ora(`[${PKG_NAME}] 存在新版本，将升级至 ${updateVersion}`);
    updateing.start();
    execSync(`${npmType} i -g ${PKG_NAME}`);
    updateing.stop();
  } else if (updateVersion) {
    //提示版本更新，不安装依赖
    log.warn(
      `当前版本为 ${PKG_VERSION}, 最新版本为 ${updateVersion}。\n
      如需更新版本，你可执行 ${npmType} install -g ${PKG_NAME}@latest。`
    );
  } else if (install) {
    //版本是最新，无需更新
    log.info('当前版本已经是最新啦/当前没有可用的更新');
  } else {
    log.info('当前没有可用更新，且初始化默认不自动安装依赖');
  }
}