import { execSync } from "child_process";
import * as fs from "fs";
import * as glob from "glob";
import * as path from "path";

// Check parameters
if (process.argv.length < 2) {
  console.error(`Usage: ${process.argv[1]} <projectDirectory>`);
  process.exit(1);
}

const projectName = process.argv[2];

// Check environment
const grumpycorpRoot = process.env.GRUMPYCORP_ROOT;

if (!grumpycorpRoot) {
  console.error("Environment variable GRUMPYCORP_ROOT must be defined. Exiting.");
  process.exit(1);
}

// Set up paths
const packageRoot = process.cwd();
const projectRoot = path.join(packageRoot, projectName);
const projectGeneratedRoot = path.join(projectRoot, "generated");

const sharedPackageRoot = path.join(packageRoot, "../shared/");
const schemasRoot = path.join(sharedPackageRoot, "src/schema");

// Make sure the output directory for generated files exists
if (!fs.existsSync(projectGeneratedRoot)) {
  fs.mkdirSync(projectGeneratedRoot);
}

//
// Codegen Flatbuffers
//

const flatbuffersRoot = path.join(grumpycorpRoot, "flatbuffers");

const fixIncludePathsInFile = (fileName: string) => {
  // Modify include locations from "flatbuffers/{foo.h}" to "{foo.h}"
  // because we don't get to set additional include roots with the Particle compiler
  const fileContent = fs.readFileSync(fileName).toString();

  const fixedUpFileContent = fileContent.replace(/#include "flatbuffers\//g, '#include "');

  fs.writeFileSync(fileName, fixedUpFileContent);
};

// Run codegen
["firmware.fbs"].map((fbs) => {
  const flatbuffersSchema = path.join(schemasRoot, fbs);
  console.log(`Processing ${flatbuffersSchema}`);

  execSync(
    `${flatbuffersRoot}/flatc --cpp --scoped-enums -o ${projectGeneratedRoot} ${flatbuffersSchema}`,
    {
      stdio: "inherit",
    }
  );

  fixIncludePathsInFile(path.join(projectGeneratedRoot, fbs.replace(".fbs", "_generated.h")));
});

// Copy C++ headers
const flatbuffersIncludesSource = path.join(flatbuffersRoot, "include/flatbuffers");

glob.sync(`${flatbuffersIncludesSource}/*.h`).forEach((source) => {
  const relativeSourcePath = path.relative(flatbuffersIncludesSource, source).replace("\\", "/");
  const destination = path.join(projectGeneratedRoot, relativeSourcePath);

  console.log(`Rewriting ${source} -> ${destination}`);
  fs.copyFileSync(source, destination);
  fixIncludePathsInFile(destination);
});
