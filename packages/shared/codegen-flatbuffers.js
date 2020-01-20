const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const grumpycorpRoot = process.env.GRUMPYCORP_ROOT;

if (!grumpycorpRoot) {
  console.log("Environment variable GRUMPYCORP_ROOT must be defined. Exiting.");
  process.exit(1);
}

// Set up paths
const packageRoot = process.cwd();
const projectRoot = path.join(packageRoot, "src");

const projectGeneratedRoot = path.join(projectRoot, "generated");
const projectSchemasRoot = path.join(projectRoot, "schema");

// Make sure the output directory for generated files exists
if (!fs.existsSync(projectGeneratedRoot)) {
  fs.mkdirSync(projectGeneratedRoot);
}

const flatbuffersRoot = path.join(grumpycorpRoot, "flatbuffers");

// Run codegen
const fixIncludePathsInFile = fileName => {
  // Modify include locations from "flatbuffers/{foo.h}" to "{foo.h}"
  // because we don't get to set additional include roots with the Particle compiler
  const fileContent = fs.readFileSync(fileName).toString();

  const fixedUpFileContent = fileContent.replace(
    'import { flatbuffers } from "./flatbuffers"',
    'import { flatbuffers } from "../flatbuffers"'
  );

  fs.writeFileSync(fileName, fixedUpFileContent);
};

["firmware.fbs"].map(fbs => {
  const flatbuffersSchema = path.join(projectSchemasRoot, fbs);
  console.log(`Processing ${flatbuffersSchema}`);
  execSync(`${flatbuffersRoot}/flatc --ts -o ${projectGeneratedRoot} ${flatbuffersSchema}`, {
    stdio: "inherit",
  });

  fixIncludePathsInFile(path.join(projectGeneratedRoot, fbs.replace(".fbs", "_generated.ts")));
});
