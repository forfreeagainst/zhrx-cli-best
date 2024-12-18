#!/usr/bin/env node

import { program } from 'commander';
import init from './actions/init';
import { PKG_NAME,PKG_VERSION} from './utils/constant';

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
  .name(PKG_NAME)
  .description('zhrx前端编码工程化脚手架')
  .version(PKG_VERSION);
// program
//   .option('-s, --small', 'small pizza size')
//   .option('-c, --cheese [type]', 'Add cheese with optional type');

program.parse(process.argv);
