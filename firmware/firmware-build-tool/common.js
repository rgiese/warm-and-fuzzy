const path = require("path");

const getBuiltImagePath = (projectRoot, projectName) => {
  return path.join(projectRoot, "out", projectName + ".bin");
};

module.exports = { getBuiltImagePath };
