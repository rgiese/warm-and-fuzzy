import IndexedThermostatSetting from "./IndexedThermostatSetting";

type OnSave = (updatedThermostatSetting: IndexedThermostatSetting) => Promise<void>;
export default OnSave;
