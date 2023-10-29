import { join } from "path";

export const getBuiltImagePath = (projectRoot, projectName) => {
  return join(projectRoot, "build", projectName + ".bin");
};
