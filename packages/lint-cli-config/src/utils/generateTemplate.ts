import path from "path";
import { globSync } from 'glob';
import fs from 'fs-extra';
import ejs from 'ejs';
import {
  ESLINT_IGNORE_PATTERN,
  MARKDOWN_LINT_IGNORE_PATTERN,
  STYLELINT_FILE_EXT,
  STYLELINT_IGNORE_PATTERN
} from "./constant";

export default async (cwd: string, config: Record<string, any>) => {
  //注意config要进行打包
  //  "build": "rm -rf lib && npm run copyfiles && tsc",
  //  "copyfiles": "copyfiles -a -u 1 \"src/config/**\" lib",
  // copyfiles是开发依赖，copyfiles用途：在script命令通过Node.js的fs模块完成I/O操作
  const templatePath = path.resolve(__dirname, '../config')
  const templateArr = globSync("**/*.ejs", { cwd: templatePath });
  console.log("🚀 ~ templateArr:", templateArr)
  for (let name of templateArr) {
    const filepath = path.resolve(cwd, name.replace(/\.ejs$/, '').replace(/^_/, '.'));
    let content = ejs.render(fs.readFileSync(path.resolve(templatePath, name), 'utf8'), {
      eslintIgnores: ESLINT_IGNORE_PATTERN,
      stylelintExt: STYLELINT_FILE_EXT,
      stylelintIgnores: STYLELINT_IGNORE_PATTERN,
      markdownLintIgnores: MARKDOWN_LINT_IGNORE_PATTERN,
      ...config,
    });
    // 跳过空文件
    if (!content.trim()) continue;
    fs.outputFileSync(filepath, content, 'utf8');
  }
}  
