import React from "react";
import { Button, Checkbox, Form, Message, Popup } from "semantic-ui-react";

import { ThermostatSettingSchema } from "@grumpycorp/warm-and-fuzzy-shared";
import { ThermostatSettingsHelpers } from "@grumpycorp/warm-and-fuzzy-shared-client";

import IndexedThermostatSetting from "./IndexedThermostatSetting";
import InteriorPadding from "./InteriorPadding";

const DaysOfWeekPopup: React.FunctionComponent<{
  mutableSetting: IndexedThermostatSetting;
  updateMutableSetting: React.Dispatch<React.SetStateAction<IndexedThermostatSetting>>;
}> = ({ mutableSetting, updateMutableSetting }): React.ReactElement => {
  return (
    <Popup
      position="top center"
      wide="very"
      on="click"
      trigger={
        <Button
          content={ThermostatSettingsHelpers.FormatDaysOfWeekList(mutableSetting.daysOfWeek || [])}
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
                  daysOfWeek: ThermostatSettingsHelpers.WeekdayDays,
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
                  daysOfWeek: ThermostatSettingsHelpers.WeekendDays,
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
