import React from "react";
import { Button, Label, Popup } from "semantic-ui-react";
import { DateInput } from "semantic-ui-calendar-react";
import moment from "moment";

import SeriesColorPalette from "./SeriesColorPalette";
import SeriesInstanceProps, {
  SeriesInstanceDateFormat,
} from "../../stores/explore/SeriesInstanceProps";
import ViewSpan from "../../stores/explore/ViewSpan";

import ExploreStore from "../../stores/explore";

interface Props {
  store: ExploreStore;
  seriesInstanceProps: SeriesInstanceProps;
  padding: number;
}

class State {
  public constructor() {
    // Control states of respective popups so we can dismiss them once a new value has been selected
    this.isColorPickerOpen = false;
    this.isDatePickerOpen = false;
  }

  isColorPickerOpen: boolean;
  isDatePickerOpen: boolean;
}

class SeriesInstanceBean extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = new State();
  }

  private handleColorPickerOpen = (): void => {
    this.setState({ isColorPickerOpen: true });
  };

  private handleColorPickerClose = (): void => {
    this.setState({ isColorPickerOpen: false });
  };

  private handleColorChanged = (colorIndex: number): void => {
    this.handleColorPickerClose();
    this.props.store.updateSeriesInstance({ ...this.props.seriesInstanceProps, colorIndex });
  };

  private handleDateInputPopupOpen = (): void => {
    this.setState({ isDatePickerOpen: true });
  };

  private handleDateInputPopupClose = (): void => {
    this.setState({ isDatePickerOpen: false });
  };

  private handleDatePicked = (_event: React.SyntheticEvent<HTMLElement>, data: any): void => {
    this.setState({ isDatePickerOpen: false });
    this.props.store.updateSeriesInstance({
      ...this.props.seriesInstanceProps,
      startDate: data.value,
    });
  };

  private handleRemoved = (): void => {
    this.props.store.removeSeriesInstance(this.props.seriesInstanceProps);
  };

  public render(): React.ReactElement {
    const interiorPadding = 8;

    return (
      <Button.Group
        color={SeriesColorPalette[this.props.seriesInstanceProps.colorIndex].semanticColor}
        style={{ padding: this.props.padding }}
      >
        <Popup
          on="click"
          trigger={
            <Button
              content={this.props.seriesInstanceProps.seriesIdentifier.name}
              style={{ paddingLeft: interiorPadding, paddingRight: interiorPadding / 2 }}
            />
          }
          // See note in `State` re: controlling open/close;
          // onOpen/onClose are called by this popup when it itself thinks it should open/close
          open={this.state.isColorPickerOpen}
          onOpen={this.handleColorPickerOpen}
          onClose={this.handleColorPickerClose}
        >
          <Popup.Content>
            {SeriesColorPalette.map((color, index) => {
              return (
                <Label
                  key={color.semanticColor}
                  as="a"
                  circular
                  color={color.semanticColor}
                  style={
                    // Provide subtle highlighting by scale to selected color
                    index === this.props.seriesInstanceProps.colorIndex % SeriesColorPalette.length
                      ? { transform: `scale(0.75, 0.75)` }
                      : undefined
                  }
                  onClick={() => this.handleColorChanged(index)}
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
          trigger={
            <Button
              style={{ paddingLeft: interiorPadding / 2, paddingRight: interiorPadding }}
              content={
                (this.props.store.viewSpan === ViewSpan.Day ? "on" : "beginning") +
                " " +
                moment(this.props.seriesInstanceProps.startDate).format("ddd ll")
              }
            />
          }
          // See note in `State` re: controlling open/close;
          // onOpen/onClose are called by this control when it itself thinks it should open/close
          open={this.state.isDatePickerOpen}
          onOpen={this.handleDateInputPopupOpen}
          onClose={this.handleDateInputPopupClose}
        >
          <Popup.Content>
            {/* animation issue: https://github.com/arfedulov/semantic-ui-calendar-react/issues/152 */}
            <DateInput
              inline
              animation={"none" as any}
              dateFormat={SeriesInstanceDateFormat}
              maxDate={moment().format(SeriesInstanceDateFormat)}
              value={this.props.seriesInstanceProps.startDate}
              onChange={this.handleDatePicked}
            />
          </Popup.Content>
        </Popup>
        <Button
          style={{
            paddingLeft: interiorPadding,
            paddingRight: interiorPadding,
            opacity: 0.8,
          }}
          icon="remove"
          onClick={this.handleRemoved}
        />
      </Button.Group>
    );
  }
}

export default SeriesInstanceBean;
