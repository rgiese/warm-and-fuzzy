import { execSync } from "child_process";
import * as path from "path";

import { getBuiltImagePath } from "./common";

// Check parameters
if (process.argv.length < 2) {
  console.error(`Usage: ${process.argv[1]} <projectDirectory>`);
  process.exit(1);
}

const projectName = process.argv[2];

// Set up paths
const packageRoot = process.cwd();
const projectRoot = path.join(packageRoot, projectName);

const builtImage = getBuiltImagePath(projectRoot, projectName);

console.log(`Flashing ${projectRoot}...`);

execSync(`particle flash --usb ${builtImage}`, { cwd: projectRoot, stdio: "inherit" });
