import type { PKG } from '../types';
import fs from 'fs-extra';
import path from 'path';
import { globSync } from 'glob';
import log from '../utils/log';
import { PKG_NAME } from '../utils/constant';
import inquirer from 'inquirer';

// 精确移除依赖
const packageNamesToRemove = [
  '@babel/eslint-parser',
  '@commitlint/cli',
  '@iceworks/spec',
  'babel-eslint',
  'eslint',
  'husky',
  'markdownlint',
  'prettier',
  'stylelint',
  'tslint',
];

// 按前缀移除依赖
const packagePrefixesToRemove = [
  '@commitlint/',
  '@typescript-eslint/',
  'eslint-',
  'stylelint-',
  'markdownlint-',
  'commitlint-',
];  

//获取不需要包的配制文件
const getUselessConfig = (cwd:string): Array<any> => {
  return []
    //这个@，还需观察含义。globSync
    .concat(globSync('.eslintrc?(.@(yaml|yml|json))', { cwd }))
    .concat(globSync('.stylelintrc?(.@(yaml|yml|json))', { cwd }))
    .concat(globSync('.markdownlint@(rc|.@(yaml|yml|jsonc))', { cwd }))
    .concat(
      globSync('.prettierrc?(.@(cjs|config.js|config.cjs|yaml|yml|json|json5|toml))',
      { cwd }),
    )
    .concat(globSync('tslint.@(yaml|yml|json)', { cwd }))
    .concat(globSync('.kylerc?(.@(yaml|yml|json))', { cwd }));
}
//获取要重写的配制
const getRewriteConfig = (cwd: string) :Array<any> => {
  return globSync('**/*.ejs', { cwd: path.resolve(__dirname, '../config') })
    .map((name) => name.replace(/^_/, '.').replace(/\.ejs$/, ''))
    .filter((filename) => fs.existsSync(path.resolve(cwd, filename)));
};

// 移除Package.json的依赖，移除对应包的配制文件
// 获取重写配制文件提示了下
export default async (cwd: string, isRewriteConfig?: boolean) => {
  const pkg: PKG = fs.readJSONSync(path.resolve(cwd, 'package.json'));
  //获取package.json安装的所有依赖
  const packages = []
    .concat(Object.keys(pkg.dependencies || {}))
    .concat(Object.keys(pkg.devDependencies || {}));
  const willRemovePackages = packages.filter(name => 
    packageNamesToRemove.includes(name)
    || packagePrefixesToRemove.some(prefix => prefix.startsWith(name))
  )
  console.log("🚀 ~ willRemovePackages:", willRemovePackages)
  const uselessConfig = getUselessConfig(cwd);
  console.log("🚀 ~ uselessConfig:", uselessConfig)
  const rewriteConfig = getRewriteConfig(cwd);
  console.log("🚀 ~ rewriteConfig:", rewriteConfig)

  //提示是否修改原有项目的配置
  const changeCount = willRemovePackages.length + uselessConfig.length + rewriteConfig.length;
  if (changeCount > 0) {
    log.warn(`检测到项目中存在可能与 ${PKG_NAME} 冲突的依赖和配置，为保证正常运行将`);

    if (willRemovePackages.length > 0) {
      log.warn('删除以下依赖：');
      //JSON.stringfy（**,null, 2）空格缩进两个
      log.warn(JSON.stringify(willRemovePackages, null, 2));
    } 
    if (uselessConfig.length > 0) {
      log.warn('删除以下配置文件：');
      log.warn(JSON.stringify(uselessConfig, null, 2));
    }
    if (rewriteConfig.length > 0) {
      log.warn('覆盖以下配置文件：');
      log.warn(JSON.stringify(rewriteConfig, null, 2));
    }

    if (isRewriteConfig) {
      const { isConfirm } = await inquirer.prompt({
        type: 'confirm',
        name: 'isConfirm',
        message: `请确认是否继续：`,
        default: true,
      });
      if (!isConfirm) process.exit(0);
    } else {
      process.exit(0);
    }
  }

  // 删除配置文件
  for (const name of uselessConfig) {
    fs.removeSync(path.resolve(cwd, name));
  }

  // 移除对应的依赖
  for (const name of willRemovePackages) {
    delete (pkg.dependencies || {})[name];
    delete (pkg.devDependencies || {})[name];
  }

  // 修正 package.json,package.json会有这些????
  delete pkg.eslintConfig;
  delete pkg.eslintIgnore;
  delete pkg.stylelint;

  fs.writeFileSync(path.resolve(cwd, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8');
}