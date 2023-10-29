import * as fs from "fs";
import * as glob from "glob";
import { execSync } from "child_process";
import * as path from "path";

import { getBuiltImagePath } from "./common";

// Check parameters
if (process.argv.length < 2) {
  console.error(`Usage: ${process.argv[1]} <projectDirectory>`);
  process.exit(1);
}

const projectName = process.argv[2];

// Check environment
const particleAccessToken = process.env.PARTICLE_ACCESS_TOKEN;

if (!particleAccessToken) {
  console.error("Environment variable PARTICLE_ACCESS_TOKEN must be defined.");
  process.exit(1);
}

// Log in Particle CLI
execSync(`particle login --token ${particleAccessToken}`, { stdio: "inherit" });

// Set up paths
const packageRoot = process.cwd();
const projectRoot = path.join(packageRoot, projectName);

const builtImage = getBuiltImagePath(projectRoot, projectName);

{
  // Ensure built image directory exists
  const builtImageDirectory = path.dirname(builtImage);
  if (!fs.existsSync(builtImageDirectory)) {
    fs.mkdirSync(builtImageDirectory);
  }
}

// Create clean temporary directory
const buildRoot = path.join(packageRoot, "build");

if (!fs.existsSync(buildRoot)) {
  fs.mkdirSync(buildRoot);
}

const projectBuildRoot = path.join(buildRoot, projectName);

if (fs.existsSync(projectBuildRoot)) {
  fs.rmSync(projectBuildRoot, { recursive: true, force: true });
}

// Collect source files
console.log(`Building ${projectRoot} in ${projectBuildRoot}...`);

glob
  .sync(`${projectRoot}/**/*.{c,cpp,h,hpp,properties}`, { ignore: "**/tests/**/*" })
  .forEach((fileName) => {
    // Locate source file
    const relativePath = path.relative(projectRoot, fileName).replace("\\", "/"); // for Windows

    // Copy source file to temporary directory
    const destinationPath = path.join(projectBuildRoot, relativePath);

    {
      // Ensure destination directory exists
      const destinationDirectory = path.dirname(destinationPath);

      if (!fs.existsSync(destinationDirectory)) {
        fs.mkdirSync(destinationDirectory, { recursive: true });
      }
    }

    fs.copyFileSync(fileName, destinationPath);
  });

// Compile
execSync(`particle compile photon --saveTo ${builtImage}`, {
  cwd: projectBuildRoot,
  stdio: "inherit",
});
