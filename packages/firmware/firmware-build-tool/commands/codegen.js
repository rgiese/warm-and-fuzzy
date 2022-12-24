const { Command, flags } = require("@oclif/command");
const { execSync } = require("child_process");
const fs = require("fs");
const glob = require("glob");
const path = require("path");

class CodegenCommand extends Command {
  async run() {
    // Check parameters
    const { flags } = this.parse(CodegenCommand);

    if (!flags.project) {
      this.error("No project directory specified (-p). Exiting.");
      return;
    }

    const grumpycorpRoot = process.env.GRUMPYCORP_ROOT;

    if (!grumpycorpRoot) {
      this.error("Environment variable GRUMPYCORP_ROOT must be defined. Exiting.");
      return;
    }

    // Set up paths
    const packageRoot = process.cwd();
    const projectRoot = path.join(packageRoot, flags.project);
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

    const fixIncludePathsInFile = fileName => {
      // Modify include locations from "flatbuffers/{foo.h}" to "{foo.h}"
      // because we don't get to set additional include roots with the Particle compiler
      const fileContent = fs.readFileSync(fileName).toString();

      const fixedUpFileContent = fileContent.replace(/#include "flatbuffers\//g, '#include "');

      fs.writeFileSync(fileName, fixedUpFileContent);
    };

    // Run codegen
    ["firmware.fbs"].map(fbs => {
      const flatbuffersSchema = path.join(schemasRoot, fbs);
      this.log(`Processing ${flatbuffersSchema}`);

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

    glob
    .sync(`${flatbuffersIncludesSource}/*.h`)
    .forEach(source => {
      const relativeSourcePath = path.relative(flatbuffersIncludesSource, source).replace("\\", "/");
      const destination = path.join(projectGeneratedRoot, relativeSourcePath);

      this.log(`Rewriting ${source} -> ${destination}`);
      fs.copyFileSync(source, destination);
      fixIncludePathsInFile(destination);
    });
  }
}

CodegenCommand.description = `Generate files for firmware project
...
Provide name of project directory with -p
`;

CodegenCommand.flags = {
  project: flags.string({ char: "p", description: "Project to codegen for" }),
};

module.exports = CodegenCommand;
