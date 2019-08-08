import Config from "react-native-config";
import { ClientConfiguration } from "@grumpycorp/warm-and-fuzzy-shared";

// Default to dev stage
export const ConfigStageName = Config.REACT_NATIVE_API_STAGE || "dev";

export default ClientConfiguration.ByStage[ConfigStageName];
