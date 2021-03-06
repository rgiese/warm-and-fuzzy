const { execSync } = require("child_process");
const { Command } = require("@oclif/command");

class MonitorCommand extends Command {
  async run() {
    execSync(`particle serial monitor`, { stdio: "inherit" });
  }
}

MonitorCommand.description = `Open Particle device monitor`;

module.exports = MonitorCommand;
