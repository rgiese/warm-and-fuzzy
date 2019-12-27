import React from "react";
import fastCompare from "react-fast-compare";
import { Button, Checkbox, Form, Message, Popup } from "semantic-ui-react";

import { ThermostatSettingSchema } from "@grumpycorp/warm-and-fuzzy-shared";

import * as GraphQL from "../../generated/graphqlClient";

import IndexedThermostatSetting from "./IndexedThermostatSetting";
import InteriorPadding from "./InteriorPadding";

const DaysOfWeekPopup: React.FunctionComponent<{
  mutableSetting: IndexedThermostatSetting;
  updateMutableSetting: React.Dispatch<React.SetStateAction<IndexedThermostatSetting>>;
}> = ({ mutableSetting, updateMutableSetting }): React.ReactElement => {
  const isWeekend = (dayOfWeek: GraphQL.DayOfWeek): boolean => {
    return [GraphQL.DayOfWeek.Saturday, GraphQL.DayOfWeek.Sunday].includes(dayOfWeek);
  };

  const weekdayDays = ThermostatSettingSchema.DaysOfWeek.filter(dayOfWeek => !isWeekend(dayOfWeek));

  const weekendDays = ThermostatSettingSchema.DaysOfWeek.filter(dayOfWeek => isWeekend(dayOfWeek));

  // Rebuild in-day-order array for display and comparison purposes since they may be returned in arbitrary order
  const selectedDays = ThermostatSettingSchema.DaysOfWeek.filter(dayOfWeek =>
    mutableSetting.daysOfWeek?.includes(dayOfWeek)
  );

  const displayDays = (): string => {
    if (selectedDays.length === ThermostatSettingSchema.DaysOfWeek.length) {
      return "Everyday";
    }

    if (fastCompare(selectedDays, weekdayDays)) {
      return "Weekdays";
    }

    if (fastCompare(selectedDays, weekendDays)) {
      return "Weekends";
    }

    return selectedDays.map(day => day.substr(0, 3)).join(", ");
  };

  return (
    <Popup
      position="top center"
      wide="very"
      on="click"
      trigger={
        <Button
          content={displayDays()}
          style={{ paddingLeft: InteriorPadding / 2, paddingRight: InteriorPadding / 4 }}
        />
      }
    >
      <Popup.Content>
        <Form>
          <Form.Group inline>
            <Button
              basic
              size="mini"
              content="weekdays"
              onClick={() =>
                updateMutableSetting({
                  ...mutableSetting,
                  daysOfWeek: weekdayDays,
                })
              }
            />
            <Button
              basic
              size="mini"
              content="weekends"
              onClick={() =>
                updateMutableSetting({
                  ...mutableSetting,
                  daysOfWeek: weekendDays,
                })
              }
            />
          </Form.Group>
          {(!mutableSetting.daysOfWeek || !mutableSetting.daysOfWeek.length) && (
            <Message negative size="small">
              Must select at least one day.
            </Message>
          )}
          {ThermostatSettingSchema.DaysOfWeek.map(dayOfWeek => (
            <Form.Group key={dayOfWeek}>
              <Checkbox
                label={dayOfWeek}
                checked={mutableSetting.daysOfWeek?.includes(dayOfWeek)}
                onChange={() => {
                  const daysOfWeek = mutableSetting.daysOfWeek?.includes(dayOfWeek)
                    ? mutableSetting.daysOfWeek?.filter(allowedDay => allowedDay !== dayOfWeek)
                    : mutableSetting.daysOfWeek?.concat(dayOfWeek);

                  updateMutableSetting({ ...mutableSetting, daysOfWeek });
                }}
              />
            </Form.Group>
          ))}
        </Form>
      </Popup.Content>
    </Popup>
  );
};

export default DaysOfWeekPopup;
