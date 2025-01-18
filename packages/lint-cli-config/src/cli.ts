#!/usr/bin/env node

import { program } from 'commander';
import init from './actions/init';
import { PKG_NAME,PKG_VERSION} from './utils/constant';
import { globSync } from 'glob';
import path from 'path';
import fs from 'fs-extra';
import getNpmType from './utils/npmType';
import log from './utils/log';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import scan from './actions/scan';

//本地开发记得在对的路径打包构建
const cwd = process.cwd();
program
  // 包名 init(command是必输，option是选输)
  .command('init')
  .description("一键接入：接入前端编码规范工程化架子。")
  //??? --vscode
  .action(function (opt) {//args是选项值，如：Object: {fix: true}
    init({
      cwd,
      checkVersionUpdate: true
    });
  });

program
  .command('scan')
  .description('一键扫描：对项目进行代码规范问题进行扫描')
  .action(async (opt) => {
    //通过lint工具的功能，进行扫描，查看一下依赖是否安装，如果没有，自动安装一下
    const lintConfigFiles = [].concat(
      globSync('.eslintrc?(.@(js|yaml|yml|json))', { cwd }),
      globSync('.stylelintrc?(.@(js|yaml|yml|json))', { cwd }),
      globSync('.markdownlint(.@(yaml|yml|json))', { cwd }),
    );
    const node_modulesPath = path.resolve(cwd, "nodemodules");
    //这里也有可能有依赖，但没有对应lint工具的依赖。这是个bug
    if (!fs.existsSync(node_modulesPath) && lintConfigFiles.length >0) {
      const npmType = getNpmType();
      log.info(`使用项目 Lint 配置，检测到项目未安装依赖，将进行安装（执行 ${npmType} install）`);
      const { isInstall } = await inquirer.prompt({
        type: 'confirm',
        name: 'isInstall',
        //你确定要使用唯一的外挂 no(界面会显示yes或者no)
        message: "是否安装依赖，选择是，现在将会进行安装",
        default: true
      });
      if (isInstall) {
        execSync(`cd ${cwd} && ${npmType} i`);
      } else {
        process.exit(0);
      }
    }

    //使用lint工具本身的能力进行扫描
    await scan({
      cwd
    })
  })

program
  .name(PKG_NAME)
  .description('zhrx前端编码工程化脚手架')
  .version(PKG_VERSION);
// program
//   .option('-s, --small', 'small pizza size')
//   .option('-c, --cheese [type]', 'Add cheese with optional type');

program.parse(process.argv);
