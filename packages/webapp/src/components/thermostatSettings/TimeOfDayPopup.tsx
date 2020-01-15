import React from "react";
import { Button, Popup } from "semantic-ui-react";
import { TimeInput } from "semantic-ui-calendar-react";

import { ThermostatSettingsHelpers } from "@grumpycorp/warm-and-fuzzy-shared-client";

import IndexedThermostatSetting from "./IndexedThermostatSetting";
import InteriorPadding from "./InteriorPadding";

const TimeOfDayPopup: React.FunctionComponent<{
  mutableSetting: IndexedThermostatSetting;
  updateMutableSetting: React.Dispatch<React.SetStateAction<IndexedThermostatSetting>>;
}> = ({ mutableSetting, updateMutableSetting }): React.ReactElement => {
  const timeOfDay = mutableSetting.atMinutesSinceMidnight || 0;

  return (
    // We use a Popup to house an inline (always displayed) TimeInput because the TimeInput
    // can otherwise not help itself from showing a textual representation in its own `dateFormat`
    // which is not worth trying to parse around.
    <Popup
      position="top center"
      wide="very"
      on="click"
      trigger={
        <Button
          content={`at ${ThermostatSettingsHelpers.FormatMinutesSinceMidnight(timeOfDay)}`}
          style={{ paddingLeft: InteriorPadding / 4, paddingRight: InteriorPadding / 2 }}
        />
      }
    >
      <Popup.Content>
        {/* animation issue: https://github.com/arfedulov/semantic-ui-calendar-react/issues/152 */}
        <TimeInput
          inline
          animation={"none" as any}
          value={ThermostatSettingsHelpers.FormatMinutesSinceMidnight(timeOfDay)}
          onChange={(_event, { value }) =>
            updateMutableSetting({
              ...mutableSetting,
              atMinutesSinceMidnight: ThermostatSettingsHelpers.ParseMinutesSinceMidnight(value),
            })
          }
        />
      </Popup.Content>
    </Popup>
  );
};

export default TimeOfDayPopup;
