import { Button, Popup } from "semantic-ui-react";

import InteriorPadding from "./InteriorPadding";
import React from "react";
import { ThermostatSettingsHelpers } from "@grumpycorp/warm-and-fuzzy-shared-client";
import { TimeInput } from "semantic-ui-calendar-react";

const TimeOfDayPopup: React.FunctionComponent<{
  mutableSetting: ThermostatSettingsHelpers.IndexedThermostatSetting;
  updateMutableSetting: React.Dispatch<
    React.SetStateAction<ThermostatSettingsHelpers.IndexedThermostatSetting>
  >;
}> = ({ mutableSetting, updateMutableSetting }): React.ReactElement => {
  const timeOfDay = mutableSetting.atMinutesSinceMidnight || 0;

  return (
    // We use a Popup to house an inline (always displayed) TimeInput because the TimeInput
    // can otherwise not help itself from showing a textual representation in its own `dateFormat`
    // which is not worth trying to parse around.
    <Popup
      on="click"
      position="top center"
      trigger={
        <Button
          content={`at ${ThermostatSettingsHelpers.FormatMinutesSinceMidnight(timeOfDay)}`}
          style={{ paddingLeft: InteriorPadding / 4, paddingRight: InteriorPadding / 2 }}
        />
      }
      wide="very"
    >
      <Popup.Content>
        {/* animation issue: https://github.com/arfedulov/semantic-ui-calendar-react/issues/152 */}
        <TimeInput
          animation={"none" as any}
          inline
          onChange={(_event, { value }): void =>
            updateMutableSetting({
              ...mutableSetting,
              atMinutesSinceMidnight: ThermostatSettingsHelpers.ParseMinutesSinceMidnight(value),
            })
          }
          value={ThermostatSettingsHelpers.FormatMinutesSinceMidnight(timeOfDay)}
        />
      </Popup.Content>
    </Popup>
  );
};

export default TimeOfDayPopup;
