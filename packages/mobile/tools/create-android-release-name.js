const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const playFilesRoot = "./android/app/src/main/play";

const releaseNameFilePath = path.resolve(playFilesRoot, "release-names", "internal.txt");
const releaseNotesFilePath = path.resolve(playFilesRoot, "release-notes", "en-US", "internal.txt");

let branch;
let commitHash;
let commitInfo;
let buildUrl;

if (process.env["CIRCLE_BRANCH"]) {
    branch = process.env["CIRCLE_BRANCH"];
    commitHash = process.env["CIRCLE_SHA1"].substr(0, 7);
    commitInfo = execSync("git log --format=oneline -n 1 --abbrev-commit $CIRCLE_SHA1").toString().replace(/(\r\n|\n|\r)/gm, "").trim();
    buildUrl = process.env["CIRCLE_BUILD_URL"];
} else {
    branch = execSync("git branch --show-current").toString().replace(/(\r\n|\n|\r)/gm, "").trim();
    commitHash = "<none>";
    commitInfo = "<work in progress>";
    buildUrl = "<none>";
}

const releaseNameData = `${branch}.${commitHash}`;
console.log(`Release name: ${releaseNameData}`);
fs.writeFileSync(releaseNameFilePath, releaseNameData);

const releaseNotesData = `${branch}.${commitHash}\n${commitInfo}\n${buildUrl}\n`;
console.log(`Release notes:\n${releaseNotesData}`);
fs.writeFileSync(releaseNotesFilePath, releaseNotesData);
