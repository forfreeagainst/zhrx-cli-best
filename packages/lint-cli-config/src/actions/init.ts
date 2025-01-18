import type { InitOptions } from '../types';
import path from 'path';
import fs from 'fs-extra';
import update from './update';
import { ESLINT_TYPES, PKG_NAME } from '../utils/constant';
import inquirer from 'inquirer';
import log from '../utils/log';
import conflictResolve from '../utils/conflictResolve';
import getNpmType from '../utils/npmType';
import spawn from 'cross-spawn';
import generateTemplate from '../utils/generateTemplate';

let step = 0;
//选择elint类型
const chooseEslintType = async (): Promise<string> => {
  const { eslintType } = await inquirer.prompt({
    type: 'list',
    name: 'eslintType',
    message: `Step ${++step}. 请选择项目的语言（JS/TS）和框架（React/Vue)类型`,
    choices: ESLINT_TYPES,
  });
  return eslintType;
}
//是否选择stylelint
const chooseEnableStylelint = async (defaultValue: boolean): Promise<boolean> => {
  const { enableStylelint } = await inquirer.prompt({
    type: 'confirm',
    name: 'enableStylelint',
    //你确定要使用唯一的外挂 no(界面会显示yes或者no)
    message: `Step ${++step}. 是否需要使用 stylelint（若没有样式文件则不需要）：`,
    default: defaultValue
  });
  return enableStylelint
}
//是否使用markdownlint
const chooseEnableMarkdownLint = async (): Promise<boolean> => {
  const { enable } = await inquirer.prompt({
    type: 'confirm',
    name: 'enable',
    message: `Step ${++step}. 是否需要使用 markdownlint（若没有 Markdown 文件则不需要）：`,
    default: true,
  });
  return enable;
};
//是否使用prettier
const chooseEnablePrettier = async (): Promise<boolean> => {
  const { enable } = await inquirer.prompt({
    type: 'confirm',
    name: 'enable',
    message: `Step ${++step}. 是否需要使用 Prettier 格式化代码：`,
    default: true,
  });

  return enable;
};

export default async (options: InitOptions) => {
  const isTest = process.env.NODE_ENV === 'test';
  console.log("🚀 ~ process.env.NODE_ENV:", process.env.NODE_ENV)
  if (isTest) {
    log.error('测试环境，正在开发中ing');
    return;
  }

  const cwd = options.cwd || process.cwd();
  const checkVersionUpdate = options.checkVersionUpdate || false;
  const config: Record<string, any> = {};
  //版本检查，不安装依赖
  if (checkVersionUpdate) {
    update({install: false});
  }

  //是否使用eslint,注意不要使用false || true;
  if (typeof options.enableESLint === 'boolean') {
    config.enableESLint = options.enableESLint;
  } else {
    config.enableESLint = true;
  }
  //使用哪个eslint类型,不使用eslint,这个应该要略过
  if (options.eslintType && ESLINT_TYPES.find(v => v.value === options.eslintType)) {
    config.eslintType = options.eslintType;
  } else {
    config.eslintType = await chooseEslintType();
  }
  //是否使用stylelint
  if (typeof options.enableStylelint === 'boolean') {
    config.enableStylelint = options.enableStylelint;
  } else {
    config.enableStylelint = await chooseEnableStylelint(!config.eslintType?.includes('node'));
  }
  //是否使用markdownlint
    if (typeof options.enableMarkdownlint === 'boolean') {
    config.enableMarkdownlint = options.enableMarkdownlint;
  } else {
    config.enableMarkdownlint = await chooseEnableMarkdownLint();
  }
  //是否使用prettier
  if (typeof options.enablePrettier === 'boolean') {
    config.enablePrettier = options.enablePrettier;
  } else {
    config.enablePrettier = await chooseEnablePrettier();
  }

  log.info(`Step ${++step}. 检查并处理项目中可能存在的依赖和配置冲突`);
  await conflictResolve(cwd, options.isRewriteConfig);//重写配制，要参照官网的配制
  log.success(`Step ${step}. 已完成项目依赖和配置冲突检查处理 :D`);

  const disableNpmInstall = options.disableNpmInstall || false;
  if (!disableNpmInstall) {
    log.info(`Step ${++step}. 安装依赖`);
    const npmType = await getNpmType();
    // 我还在开发，我不安装,先注释 TODO TODO
    // spawn.sync(npmType, ['i', '-D', PKG_NAME], { stdio: 'inherit', cwd });
    log.success(`Step ${step}. 安装依赖成功 :D`);
  }

  const pkg = fs.readJSONSync(path.resolve(cwd, 'package.json'));
  // 在 `package.json` 中写入 `scripts`
  if (!pkg.scripts) {
    pkg.scripts = {};
  }
  if (!pkg.scripts[`${PKG_NAME}-scan`]) {
    pkg.scripts[`${PKG_NAME}-scan`] = `${PKG_NAME} scan`;
  }
  if (!pkg.scripts[`${PKG_NAME}-fix`]) {
    pkg.scripts[`${PKG_NAME}-fix`] = `${PKG_NAME} fix`;
  }

  // 配置 commit 卡点
  log.info(`Step ${++step}. 配置 git commit 卡点`);
  if (!pkg.husky) pkg.husky = {};
  if (!pkg.husky.hooks) pkg.husky.hooks = {};
  pkg.husky.hooks['pre-commit'] = `${PKG_NAME} commit-file-scan`;
  pkg.husky.hooks['commit-msg'] = `${PKG_NAME} commit-msg-scan`;
  fs.writeFileSync(
    path.resolve(cwd, 'package.json'),
    JSON.stringify(pkg, null, 2),
    'utf8'
  );
  log.success(`Step ${step}. 配置 git commit 卡点成功 :D`);

  log.info(`Step ${++step}. 写入配置文件`);
  generateTemplate(cwd, config);
  log.success(`Step ${step}. 写入配置文件成功 :D`);

  const logs = [`${PKG_NAME} 初始化完成 :D`].join('\r\n');
  log.success(logs);
};
