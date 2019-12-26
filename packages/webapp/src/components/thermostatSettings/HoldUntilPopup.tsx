import React from "react";
import { Dropdown, DropdownItemProps, DropdownProps } from "semantic-ui-react";

import moment from "moment";

import IndexedThermostatSetting from "./IndexedThermostatSetting";
import InteriorPadding from "./InteriorPadding";

const HoldUntilPopup: React.FunctionComponent<{
  mutableSetting: IndexedThermostatSetting;
  updateMutableSetting: React.Dispatch<React.SetStateAction<IndexedThermostatSetting>>;
}> = ({ mutableSetting, updateMutableSetting }): React.ReactElement => {
  const holdUntil = mutableSetting.holdUntil || new Date(0);

  const maxDateValue = new Date(Math.pow(2, 31) * 1000); // cheap sentinel value - close enough...

  const currentExpirationText = ((): string => {
    if (holdUntil.valueOf() < Date.now()) {
      return "(expired)";
    }
    if (holdUntil.valueOf() >= maxDateValue.valueOf()) {
      return "forever";
    }
    return `until ${moment(holdUntil).fromNow(true)} from now`;
  })();

  const limitsDropdownOptions: DropdownItemProps[] = [
    { key: "as-is", value: holdUntil.valueOf(), text: currentExpirationText },
    { key: "forever", value: maxDateValue.valueOf(), text: "forever" },
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
      text={`Hold ${currentExpirationText}`}
      value={holdUntil.valueOf()}
      onChange={(_event, data: DropdownProps): void => {
        updateMutableSetting({ ...mutableSetting, holdUntil: new Date(data.value as number) });
      }}
    />
  );
};

export default HoldUntilPopup;
