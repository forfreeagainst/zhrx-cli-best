import { PRETTIER_FILE_EXT, PRETTIER_IGNORE_PATTERN } from "../../utils/constant";
import path from 'path';
import fg from 'fast-glob';
import fs from 'fs-extra';
//使用较高的prettier, 一键扫描需要测试一下。
import prettier from 'prettier';

export const doPrettier = async (options) => {
  let files: string[] = [];
  if (options.files) {
    files = options.files.filter((name) => PRETTIER_FILE_EXT.includes(
      path.extname(name)
    ));
  } else {
    const pattern = path.join(
      options.include,
      `**/*.{${PRETTIER_FILE_EXT.map((t) => t.replace(/^\./, '')).join(',')}}`,
    );
    files = await fg(pattern, {
      cwd: options.cwd,
      ignore: PRETTIER_IGNORE_PATTERN,
    });
  }
  await Promise.all(files.map(formatFile));
}

async function formatFile(filepath: string) {
  const text = await fs.readFile(filepath, 'utf8');
  const options = await prettier.resolveConfig(filepath);
  const formatted = prettier.format(text, { ...options, filepath });
  await fs.writeFile(filepath, formatted, 'utf8');
}
