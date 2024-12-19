import path from "path";
import { globSync } from 'glob';


export default async (cwd: string, config: Record<string, any>) => {
  const templateArr = globSync(
    `**/*.ejs`,
    { cwd: path.resolve(__dirname, '../config') }
  );
  console.log("🚀 ~ templateArr:", templateArr)
  for (let name of templateArr) {
    const filepath = path.resolve(cwd, name.replace(/\.ejs$/, '').replace(/^_/, '.'));
    console.log("🚀 ~ filepath:", filepath)
  }
}  
