import React from "react";
import { Dropdown, DropdownItemProps, DropdownProps } from "semantic-ui-react";

import moment from "moment";

import { ThermostatSettingsHelpers } from "@grumpycorp/warm-and-fuzzy-shared-client";

import IndexedThermostatSetting from "./IndexedThermostatSetting";
import InteriorPadding from "./InteriorPadding";

const HoldUntilPopup: React.FunctionComponent<{
  mutableSetting: IndexedThermostatSetting;
  updateMutableSetting: React.Dispatch<React.SetStateAction<IndexedThermostatSetting>>;
}> = ({ mutableSetting, updateMutableSetting }): React.ReactElement => {
  const holdUntil = mutableSetting.holdUntil || new Date(0);

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

  const hourlyDropdownOptions: DropdownItemProps[] = [1, 2, 4, 8, 12, 24].map(
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
      style={{ paddingLeft: InteriorPadding / 2 }}
      options={limitsDropdownOptions.concat(hourlyDropdownOptions)}
      text={`Hold ${ThermostatSettingsHelpers.FormatHoldUntil(holdUntil)}`}
      value={holdUntil.valueOf()}
      onChange={(_event, data: DropdownProps): void => {
        updateMutableSetting({ ...mutableSetting, holdUntil: new Date(data.value as number) });
      }}
    />
  );
};

export default HoldUntilPopup;
