
export interface InitOptions {
  cwd: string;
  // 是否检查并升级 包 的版本
  checkVersionUpdate: boolean;
  // 是否需要自动重写 lint 配置
  rewriteConfig?: boolean;
  // eslint 类型
  eslintType?: string;
  // 是否启用 ESLint
  enableESLint?: boolean;
  // 是否启用 stylelint
  enableStylelint?: boolean;
  // 是否启用 markdownlint
  enableMarkdownlint?: boolean;
  // 是否启用 prettier
  enablePrettier?: boolean;
  // 是否禁用自动在初始化完成后安装依赖
  disableNpmInstall?: boolean;
}