import { ClientConfiguration } from "@grumpycorp/warm-and-fuzzy-shared";

// TODO:
// - dispatch based on stage

// Default to dev stage
export const ConfigStageName = process.env.REACT_APP_API_STAGE || "prod"; // TODO: fix me

export default ClientConfiguration.ByStage[ConfigStageName];
