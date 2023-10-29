import { join } from "path";

export const getBuiltImagePath = (projectRoot: string, projectName: string) => {
  return join(projectRoot, "build", projectName + ".bin");
};
