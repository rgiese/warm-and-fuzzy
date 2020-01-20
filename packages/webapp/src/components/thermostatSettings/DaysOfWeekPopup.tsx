import { Button, Checkbox, Form, Message, Popup } from "semantic-ui-react";

import InteriorPadding from "./InteriorPadding";
import React from "react";
import { ThermostatSettingSchema } from "@grumpycorp/warm-and-fuzzy-shared";
import { ThermostatSettingsHelpers } from "@grumpycorp/warm-and-fuzzy-shared-client";

const DaysOfWeekPopup: React.FunctionComponent<{
  mutableSetting: ThermostatSettingsHelpers.IndexedThermostatSetting;
  updateMutableSetting: React.Dispatch<
    React.SetStateAction<ThermostatSettingsHelpers.IndexedThermostatSetting>
  >;
}> = ({ mutableSetting, updateMutableSetting }): React.ReactElement => {
  return (
    <Popup
      on="click"
      position="top center"
      trigger={
        <Button
          content={ThermostatSettingsHelpers.FormatDaysOfWeekList(mutableSetting.daysOfWeek || [])}
          style={{ paddingLeft: InteriorPadding / 2, paddingRight: InteriorPadding / 4 }}
        />
      }
      wide="very"
    >
      <Popup.Content>
        <Form>
          <Form.Group inline>
            <Button
              basic
              content="weekdays"
              onClick={(): void =>
                updateMutableSetting({
                  ...mutableSetting,
                  daysOfWeek: ThermostatSettingsHelpers.WeekdayDays,
                })
              }
              size="mini"
            />
            <Button
              basic
              content="weekends"
              onClick={(): void =>
                updateMutableSetting({
                  ...mutableSetting,
                  daysOfWeek: ThermostatSettingsHelpers.WeekendDays,
                })
              }
              size="mini"
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
                checked={mutableSetting.daysOfWeek?.includes(dayOfWeek)}
                label={dayOfWeek}
                onChange={(): void => {
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
