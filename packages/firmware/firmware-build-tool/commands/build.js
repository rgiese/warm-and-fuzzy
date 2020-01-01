const { Command, flags } = require("@oclif/command");
const Particle = require("particle-api-js");
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const superagent = require("superagent");

const { getBuiltImagePath } = require("../common");

const particleService = new Particle();

class BuildCommand extends Command {
  async run() {
    // Check parameters
    const { flags } = this.parse(BuildCommand);

    if (!flags.project) {
      this.error("No project directory specified (-p). Exiting.");
      return;
    }

    const particleAccessToken = process.env.PARTICLE_ACCESS_TOKEN;

    if (!particleAccessToken) {
      this.error("Environment variable PARTICLE_ACCESS_TOKEN must be defined. Exiting.");
      return;
    }

    // Set up paths
    const packageRoot = process.cwd();
    const projectRoot = path.join(packageRoot, flags.project);

    const builtImage = getBuiltImagePath(projectRoot, flags.project);

    // Find source files
    this.log(`Building ${projectRoot}...`);

    let projectFilesObject = {};

    glob.sync(`${projectRoot}/**/*.{c,cpp,h,hpp,properties}`).forEach(fileName => {
      const relativePath = path.relative(projectRoot, fileName).replace("\\", "/");
      this.log(`  ${relativePath}`);

      projectFilesObject[relativePath] = fileName;
    });

    // Compile
    let compileResult;

    try {
      compileResult = await particleService.compileCode({
        files: projectFilesObject,
        platformId: 6 /* Photon */,
        auth: particleAccessToken,
      });
    } catch (error) {
      if (error.statusCode && error.statusCode === 406) {
        console.log("\nCompilation error:\n");
        console.log(error.body.errors[0]);
      } else {
        console.log(error);
      }
      return;
    }

    console.log(compileResult);
    console.log();

    if (!compileResult.body || !compileResult.body.ok) {
      this.error("Compile failed.");
      return;
    }

    // Make sure output directory exists
    const builtImagePath = path.dirname(builtImage);

    if (!fs.existsSync(builtImagePath)) {
      fs.mkdirSync(builtImagePath);
    }

    // Retrieve compiled binary
    this.log(`Downloading compiled firmware...`);

    let builtImageStream = fs.createWriteStream(builtImage);

    superagent
      .get(`https://api.particle.io${compileResult.body.binary_url}`)
      .query({ access_token: particleAccessToken })
      .on(
        "error",
        function(error) {
          this.error(error);
        }.bind(this)
      )
      .pipe(builtImageStream)
      .on(
        "finish",
        function() {
          this.log(`Downloaded firmware to ${builtImage}.`);
        }.bind(this)
      );
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
