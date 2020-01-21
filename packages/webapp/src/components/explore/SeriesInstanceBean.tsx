import { Button, Label, Popup } from "semantic-ui-react";
import React, { useState } from "react";
import SeriesInstanceProps, {
  SeriesInstanceDateFormat,
} from "../../stores/explore/SeriesInstanceProps";

import { DateInput } from "semantic-ui-calendar-react";
import ExploreStore from "../../stores/explore";
import SeriesColorPalette from "./SeriesColorPalette";
import ViewSpan from "../../stores/explore/ViewSpan";
import moment from "moment";

const SeriesInstanceBean: React.FunctionComponent<{
  store: ExploreStore;
  seriesInstanceProps: SeriesInstanceProps;
  padding: number;
}> = ({ store, seriesInstanceProps, padding }): React.ReactElement => {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const interiorPadding = 8;

  return (
    <Button.Group
      color={SeriesColorPalette[seriesInstanceProps.colorIndex].semanticColor}
      style={{ padding: padding }}
    >
      <Popup
        on="click"
        onClose={(): void => setIsColorPickerOpen(false)}
        // See note in `State` re: controlling open/close;
        // onOpen/onClose are called by this popup when it itself thinks it should open/close
        onOpen={(): void => setIsColorPickerOpen(true)}
        open={isColorPickerOpen}
        trigger={
          <Button
            content={seriesInstanceProps.seriesIdentifier.name}
            style={{ paddingLeft: interiorPadding, paddingRight: interiorPadding / 2 }}
          />
        }
      >
        <Popup.Content>
          {SeriesColorPalette.map((color, index) => {
            return (
              <Label
                as="a"
                circular
                color={color.semanticColor}
                key={color.semanticColor}
                onClick={(): void => {
                  store.updateSeriesInstance({ ...seriesInstanceProps, colorIndex: index });
                  setIsColorPickerOpen(false);
                }}
                style={
                  // Provide subtle highlighting by scale to selected color
                  index === seriesInstanceProps.colorIndex % SeriesColorPalette.length
                    ? { transform: `scale(0.75, 0.75)` }
                    : undefined
                }
              />
            );
          })}
        </Popup.Content>
      </Popup>

      <Popup
        // We use a Popup to house an inline (always displayed) DateInput because the DateInput
        // can otherwise not help itself from showing a textual representation in its own `dateFormat`
        // which is not worth trying to parse around.
        on="click"
        onClose={(): void => setIsDatePickerOpen(false)}
        // See note in `State` re: controlling open/close;
        // onOpen/onClose are called by this control when it itself thinks it should open/close
        onOpen={(): void => setIsDatePickerOpen(true)}
        open={isDatePickerOpen}
        trigger={
          <Button
            content={
              (store.viewSpan === ViewSpan.Day ? "on" : "beginning") +
              " " +
              moment(seriesInstanceProps.startDate).format("ddd ll")
            }
            style={{ paddingLeft: interiorPadding / 2, paddingRight: interiorPadding }}
          />
        }
      >
        <Popup.Content>
          {/* animation issue: https://github.com/arfedulov/semantic-ui-calendar-react/issues/152 */}
          <DateInput
            animation={"none" as any}
            dateFormat={SeriesInstanceDateFormat}
            inline
            maxDate={moment().format(SeriesInstanceDateFormat)}
            // data is typed as `any` -> tell eslint to go away
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
            onChange={(_event: React.SyntheticEvent<HTMLElement>, data: any): void => {
              setIsDatePickerOpen(false);

              store.updateSeriesInstance({
                ...seriesInstanceProps,
                startDate: data.value,
              });
            }}
            value={seriesInstanceProps.startDate}
          />
        </Popup.Content>
      </Popup>
      <Button
        icon="remove"
        onClick={(): void => store.removeSeriesInstance(seriesInstanceProps)}
        style={{
          paddingLeft: interiorPadding,
          paddingRight: interiorPadding,
          opacity: 0.8,
        }}
      />
    </Button.Group>
  );
};

export default SeriesInstanceBean;
