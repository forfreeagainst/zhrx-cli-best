import chalk from 'chalk';

export default {
  success(text: string) {
    console.log(chalk.green.bold(text));
  },
  error(text: string) {
    console.error(chalk.red.bold(text));
  },
  info(text: string) {
    console.info(chalk.gray.bold(text));
  },
  warn(text: string) {
    console.warn(chalk.yellow.bold(text));
  }
}