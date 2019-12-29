const { execSync } = require("child_process");
const { Command, flags } = require("@oclif/command");
const fs = require("fs");
const path = require("path");

const { getBuiltImagePath } = require("../common");

class UploadCommand extends Command {
  async run() {
    const { flags } = this.parse(UploadCommand);

    if (!flags.project) {
      this.error("No project directory specified (-p). Exiting.");
      return;
    }

    if (!flags.mainSourceFile) {
      this.error("No main source file specified (-m). Exiting.");
      return;
    }

    const particleAccessToken = process.env.PARTICLE_ACCESS_TOKEN;

    if (!particleAccessToken) {
      this.error("Environment variable PARTICLE_ACCESS_TOKEN must be defined.");
    }

    const packageRoot = process.cwd();
    const projectRoot = path.join(packageRoot, flags.project);

    // Determine product ID and version
    this.log(`Determining product ID and version for ${projectRoot}...`);

    let productId = null;
    let productVersion = null;
    {
      const mainSourceFilePath = path.join(projectRoot, flags.mainSourceFile);
      const mainSourceFile = fs
        .readFileSync(mainSourceFilePath)
        .toString()
        .split("\n");

      const productIdRegExp = /^PRODUCT_ID\((\d+)\)/;
      const productVersionRegExp = /^PRODUCT_VERSION\((\d+)\)/;

      mainSourceFile.forEach(sourceLine => {
        // Check for product ID
        const thisProductId = sourceLine.match(productIdRegExp);

        if (thisProductId) {
          productId = thisProductId[1];
        }

        // Check for product version
        const thisProductVersion = sourceLine.match(productVersionRegExp);

        if (thisProductVersion) {
          productVersion = thisProductVersion[1];
        }
      });

      if (!productId || !productVersion) {
        this.error(`Couldn't find product ID and version in ${mainSourceFilePath}. Exiting.`);
      }

      console.log(`Product ID: ${productId}, version: ${productVersion}.`);
    }

    // Upload firmware
    const builtImage = getBuiltImagePath(projectRoot, flags.project);

    const uploadUri = `https://api.particle.io/v1/products/${productId}/firmware?access_token=${particleAccessToken}`;

    const firmwareTitle = process.env.CIRCLE_SHA1
      ? `Firmware version ${productVersion} from CI build for ${process.env.CIRCLE_SHA1}`
      : `Firmware version ${productVersion}`;

    const uploadResult = execSync(
      `curl "${uploadUri}" -F binary=@${builtImage} -F version=${productVersion} -F title="${firmwareTitle}"`,
      {
        cwd: projectRoot,
      }
    ).toString();

    if (!JSON.parse(uploadResult).updated_at) {
      this.error(`Upload failed:\n${uploadResult}`);
    } else {
      console.log(`Upload completed:\n${uploadResult}`);
    }
  }
}

UploadCommand.description = `Upload product firmware
...
Provide name of project directory with -p
`;

UploadCommand.flags = {
  project: flags.string({ char: "p", description: "Project to upload firmware for" }),
  mainSourceFile: flags.string({
    char: "m",
    description:
      "Project-relative path to source file containing product ID and version definition",
  }),
};

module.exports = UploadCommand;
