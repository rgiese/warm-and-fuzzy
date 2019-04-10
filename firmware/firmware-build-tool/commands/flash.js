const { execSync } = require("child_process");
const { Command, flags } = require("@oclif/command");
const path = require("path");

const { getBuiltImagePath } = require("../common");

class FlashCommand extends Command {
  async run() {
    const { flags } = this.parse(FlashCommand);

    if (!flags.project) {
      this.error("No project directory specified (-p). Exiting.");
      return;
    }

    const packageRoot = process.cwd();
    const projectRoot = path.join(packageRoot, flags.project);

    const builtImage = getBuiltImagePath(projectRoot, flags.project);

    this.log(`Flashing ${projectRoot}...`);

    execSync(`particle flash --usb ${builtImage}`, { cwd: projectRoot, stdio: "inherit" });
  }
}

FlashCommand.description = `Flash firmware project
...
Provide name of project directory with -p
`;

FlashCommand.flags = {
  project: flags.string({ char: "p", description: "Project to flash" }),
};

module.exports = FlashCommand;
