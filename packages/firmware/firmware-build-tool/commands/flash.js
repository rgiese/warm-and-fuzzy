const { execSync } = require("child_process");
const { Command, Flags } = require("@oclif/core");
const path = require("path");

const { getBuiltImagePath } = require("../common");

class FlashCommand extends Command {
  async run() {
    const { flags } = await this.parse(FlashCommand);

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
  project: Flags.string({ char: "p", description: "Project to flash" }),
};

module.exports = FlashCommand;
