const { Command, flags } = require("@oclif/command");
const { execSync } = require("child_process");
const fs = require("fs");
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

    // Run codegen
    ["firmware.fbs"].map(fbs => {
      const flatbuffersSchema = path.join(schemasRoot, fbs);
      this.log(`Processing ${flatbuffersSchema}`);
      execSync(`${flatbuffersRoot}/flatc --cpp -o ${projectGeneratedRoot} ${flatbuffersSchema}`, {
        stdio: "inherit",
      });
    });

    // Copy C++ headers
    const flatbuffersIncludesDestination = path.join(projectGeneratedRoot, "flatbuffers");

    if (!fs.existsSync(flatbuffersIncludesDestination)) {
      fs.mkdirSync(flatbuffersIncludesDestination);
    }

    const flatbuffersIncludesSource = path.join(flatbuffersRoot, "include/flatbuffers");

    ["flatbuffers.h", "base.h"].map(header => {
      const source = path.join(flatbuffersIncludesSource, header);
      const destination = path.join(flatbuffersIncludesDestination, header);

      this.log(`Copying ${source} -> ${destination}`);
      fs.copyFileSync(source, destination);
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
