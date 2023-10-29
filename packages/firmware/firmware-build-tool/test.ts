import * as fs from "fs";
import * as glob from "glob";
import { execSync } from "child_process";
import * as path from "path";

// Check parameters
if (process.argv.length < 2) {
  console.error(`Usage: ${process.argv[1]} <projectDirectory>`);
  process.exit(1);
}

const projectName = process.argv[2];

// Set up paths
const packageRoot = process.cwd();
const projectRoot = path.join(packageRoot, projectName);
const testsRoot = path.join(projectRoot, "tests");

const outputRoot = path.join(testsRoot, "generated");

if (!fs.existsSync(outputRoot)) {
  fs.mkdirSync(outputRoot);
}

// Build
console.log(`Building tests...`);

const sourceFiles = glob.sync(`${testsRoot}/*.cpp`);
const testExecutable = path.join(outputRoot, "tests");

execSync(
  `g++ -I${projectRoot} -I${testsRoot} ${sourceFiles.join(
    " "
  )} -std=c++17 -lstdc++ -lm -o ${testExecutable}`,
  {
    cwd: testsRoot,
    stdio: "inherit",
  }
);

// Run
console.log(`Running tests...`);

execSync(testExecutable, {
  cwd: testsRoot,
  stdio: "inherit",
});
