import { Dropdown, DropdownItemProps, DropdownProps } from "semantic-ui-react";

import InteriorPadding from "./InteriorPadding";
import React from "react";
import { ThermostatSettingsHelpers } from "@grumpycorp/warm-and-fuzzy-shared-client";
import moment from "moment";

const HoldUntilPopup: React.FunctionComponent<{
  mutableSetting: ThermostatSettingsHelpers.IndexedThermostatSetting;
  updateMutableSetting: React.Dispatch<
    React.SetStateAction<ThermostatSettingsHelpers.IndexedThermostatSetting>
  >;
}> = ({ mutableSetting, updateMutableSetting }): React.ReactElement => {
  const holdUntil = mutableSetting.holdUntil ?? new Date(0);

  const limitsDropdownOptions: DropdownItemProps[] = [
    {
      key: "as-is",
      value: holdUntil.valueOf(),
      text: ThermostatSettingsHelpers.FormatHoldUntil(holdUntil),
    },
    {
      key: "forever",
      value: ThermostatSettingsHelpers.HoldUntilForeverSentinel.valueOf(),
      text: "forever",
    },
  ];

  const hourlyDropdownOptions: DropdownItemProps[] = ThermostatSettingsHelpers.HoldUntilHoursFromNowOptions.map(
    (hour): DropdownItemProps => {
      return {
        key: hour,
        value: moment()
          .add(hour, "hours")
          .toDate()
          .valueOf(),
        text: `until ${hour} hours from now`,
      };
    }
  );

  return (
    <Dropdown
      button
      onChange={(_event: React.SyntheticEvent<HTMLElement>, data: DropdownProps): void => {
        updateMutableSetting({ ...mutableSetting, holdUntil: new Date(data.value as number) });
      }}
      options={limitsDropdownOptions.concat(hourlyDropdownOptions)}
      style={{ paddingLeft: InteriorPadding / 2 }}
      text={`Hold ${ThermostatSettingsHelpers.FormatHoldUntil(holdUntil)}`}
      value={holdUntil.valueOf()}
    />
  );
};

export default HoldUntilPopup;
