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
["firmware.fbs"].map(fbs => {
  const flatbuffersSchema = path.join(projectSchemasRoot, fbs);
  console.log(`Processing ${flatbuffersSchema}`);
  execSync(`${flatbuffersRoot}/flatc --ts -o ${projectGeneratedRoot} ${flatbuffersSchema}`, {
    stdio: "inherit",
  });
});

// Copy JavaScript dependencies
const flatbuffersDependenciesDestination = projectGeneratedRoot;
const flatbuffersDependenciesSource = path.join(flatbuffersRoot, "js");

["flatbuffers.js"].map(dependency => {
  const source = path.join(flatbuffersDependenciesSource, dependency);
  const destination = path.join(flatbuffersDependenciesDestination, dependency);

  console.log(`Copying ${source} -> ${destination}`);
  fs.copyFileSync(source, destination);
});

// Copy @types/flatbuffers definition into `generated` directory
fs.copyFileSync(
  path.join(packageRoot, "node_modules/@types/flatbuffers/index.d.ts"),
  path.join(projectGeneratedRoot, "flatbuffers.d.ts")
);
