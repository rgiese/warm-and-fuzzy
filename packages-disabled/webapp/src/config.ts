import { ClientConfiguration } from "@grumpycorp/warm-and-fuzzy-shared";

// Default to dev stage
export const ConfigStageName = process.env.REACT_APP_API_STAGE ?? "dev";

export default ClientConfiguration.ByStage[ConfigStageName];
