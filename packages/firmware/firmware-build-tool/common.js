const path = require("path");

const getBuiltImagePath = (projectRoot, projectName) => {
  return path.join(projectRoot, "build", projectName + ".bin");
};

module.exports = { getBuiltImagePath };
