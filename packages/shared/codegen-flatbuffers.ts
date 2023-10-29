import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

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
const fixIncludePathsInFile = (fileName: string) => {
  // Modify import locations from "./flatbuffers" to "../flatbuffers"
  // so we don't need to copy our library code into the `generated` directory.
  const fileContent = fs.readFileSync(fileName).toString();

  const fixedUpFileContent = fileContent.replace(
    'import { flatbuffers } from "./flatbuffers"',
    'import { flatbuffers } from "../flatbuffers"'
  );

  fs.writeFileSync(fileName, fixedUpFileContent);
};

["firmware.fbs"].map((fbs) => {
  const flatbuffersSchema = path.join(projectSchemasRoot, fbs);
  console.log(`Processing ${flatbuffersSchema}`);
  execSync(`${flatbuffersRoot}/flatc --ts -o ${projectGeneratedRoot} ${flatbuffersSchema}`, {
    stdio: "inherit",
  });

  fixIncludePathsInFile(path.join(projectGeneratedRoot, fbs.replace(".fbs", "_generated.ts")));
});
