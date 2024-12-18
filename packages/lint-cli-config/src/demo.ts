#!/usr/bin/env node
import { program } from 'commander';
import init from './actions/init';

const PKG_NAME = 'luofeng-lint-cli';
const PKG_VERSION = '1.0.5';

//current working directory
const cwd = process.cwd();

program
  .version(PKG_VERSION)
  .description(
    `${PKG_NAME} 是zhrx前端编码规范工程化 的配套 Lint 工具，
    提供简单的 CLI 和 Node.js API，让项目能够一键接入、一键扫描、一键修复、一键升级，
    并为项目配置 git commit 卡点，降低项目实施规范的成本
    有缓存
    `,
);

program
  .command('init')
  .description('一键接入：为项目初始化规范工具和配置，可以根据项目类型和需求进行定制')
  .option('--vscode', '写入.vscode/setting.json配置')
  .action(async (cmd) => {
    //有--vscode, cmd 为{vscode: true}, 否则为{}
    if (cmd.vscode) {
    } else {
      await init({
        cwd,
        checkVersionUpdate: true,
      })
    }
  });
program.parse(process.argv);
