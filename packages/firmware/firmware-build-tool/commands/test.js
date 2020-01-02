const { Command, flags } = require("@oclif/command");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class TestCommand extends Command {
  async run() {
    // Check parameters
    const { flags } = this.parse(TestCommand);

    if (!flags.project) {
      this.error("No project directory specified (-p). Exiting.");
      return;
    }

    // Set up paths
    const packageRoot = process.cwd();
    const projectRoot = path.join(packageRoot, flags.project);
    const testsRoot = path.join(projectRoot, "tests");

    const outputRoot = path.join(testsRoot, "generated");

    if (!fs.existsSync(outputRoot)) {
      fs.mkdirSync(outputRoot);
    }

    const toolchains =
      process.platform === "win32"
        ? {
            makefileType: "MinGW Makefiles",
            makeCommand: "mingw32-make",
          }
        : {
            makefileType: "Unix Makefiles",
            makeCommand: "make",
          };

    // Generate makefiles
    this.log(`Generating makefiles for ${testsRoot}...`);

    execSync(
      `cmake -G "${toolchains.makefileType}" -DCMAKE_BUILD_TYPE=Release -S . -B ${outputRoot}`,
      {
        cwd: testsRoot,
        stdio: "inherit",
      }
    );

    // Build
    this.log(`Building tests...`);

    execSync(`${toolchains.makeCommand}`, {
      cwd: outputRoot,
      stdio: "inherit",
    });

    // Run
    this.log(`Running tests...`);

    execSync(`Tests`, {
      cwd: outputRoot,
      stdio: "inherit",
    });
  }
}

TestCommand.description = `Test firmware project
...
Provide name of project directory with -p
`;

TestCommand.flags = {
  project: flags.string({ char: "p", description: "Project to test" }),
};

module.exports = TestCommand;
