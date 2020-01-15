import { ThermostatSetting } from "@grumpycorp/warm-and-fuzzy-shared-client";

type IndexedThermostatSetting = ThermostatSetting & { index: number };
export default IndexedThermostatSetting;
