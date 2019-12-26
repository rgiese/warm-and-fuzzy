import IndexedThermostatSetting from "./IndexedThermostatSetting";

type OnRemove = (updatedThermostatSetting: IndexedThermostatSetting) => Promise<void>;
export default OnRemove;
