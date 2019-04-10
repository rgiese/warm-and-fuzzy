const { execSync } = require("child_process");
const { Command, flags } = require("@oclif/command");
const path = require("path");

const { getBuiltImagePath } = require("../common");

class BuildCommand extends Command {
  async run() {
    const { flags } = this.parse(BuildCommand);

    if (!flags.project) {
      this.error("No project directory specified (-p). Exiting.");
      return;
    }

    const packageRoot = process.cwd();
    const projectRoot = path.join(packageRoot, flags.project);

    const builtImage = getBuiltImagePath(projectRoot, flags.project);

    this.log(`Building ${projectRoot}...`);

    execSync(`particle compile photon --saveTo ${builtImage}`, {
      cwd: projectRoot,
      stdio: "inherit",
    });
  }
}

BuildCommand.description = `Build firmware project
...
Provide name of project directory with -p
`;

BuildCommand.flags = {
  project: flags.string({ char: "p", description: "Project to build" }),
};

module.exports = BuildCommand;
