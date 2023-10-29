import * as fs from "fs";
import { execSync } from "child_process";
import * as path from "path";

import { getBuiltImagePath } from "./common";

// Check parameters
if (process.argv.length < 3) {
  console.error(`Usage: bun ${process.argv[1]} <projectDirectory> <mainSourceFile>`);
  process.exit(1);
}

const projectName = process.argv[2];
const mainSourceFile = process.argv[3];

// Check environment

const particleAccessToken = process.env.PARTICLE_ACCESS_TOKEN;

if (!particleAccessToken) {
  console.error("Environment variable PARTICLE_ACCESS_TOKEN must be defined.");
  process.exit(1);
}

// Set up paths
const packageRoot = process.cwd();
const projectRoot = path.join(packageRoot, projectName);

// Determine product ID and version
console.log(`Determining product ID and version for ${projectRoot}...`);

let productId = null;
let productVersion = null;
{
  const mainSourceFilePath = path.join(projectRoot, mainSourceFile);
  const mainSourceFileContent = fs.readFileSync(mainSourceFilePath).toString().split("\n");

  const productIdRegExp = /^PRODUCT_ID\((\d+)\)/;
  const productVersionRegExp = /^PRODUCT_VERSION\((\d+)\)/;

  let productId: string | undefined = undefined;
  let productVersion: string | undefined = undefined;

  mainSourceFileContent.forEach((sourceLine) => {
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
    console.error(`Couldn't find product ID and version in ${mainSourceFilePath}. Exiting.`);
    process.exit(1);
  }

  console.log(`Product ID: ${productId}, version: ${productVersion}.`);
}

// Upload firmware
const builtImage = getBuiltImagePath(projectRoot, projectName);

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
  console.error(`Upload failed:\n${uploadResult}`);
  process.exit(1);
} else {
  console.log(`Upload completed:\n${uploadResult}`);
}
