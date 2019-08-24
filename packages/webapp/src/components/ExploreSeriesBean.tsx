import React from "react";
import { Button, Label, Popup } from "semantic-ui-react";
import { DateInput } from "semantic-ui-calendar-react";
import moment from "moment";

import { ColorDefinition, ColorPalette } from "../components/ExploreSeriesColors";

export interface SeriesProps {
  id: number;
  name: string;
  color: ColorDefinition;
  startDate: Date;
}

interface Props {
  seriesProps: SeriesProps;
  onChanged(data: SeriesProps): void;
  onRemoved(data: SeriesProps): void;

  isSingleDay: boolean;
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

class ExploreSeriesBean extends React.Component<Props, State> {
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

  private handleColorChanged = (value: ColorDefinition): void => {
    this.handleColorPickerClose();
    this.props.onChanged({ ...this.props.seriesProps, color: value });
  };

  private toDateInputString(date: Date): string {
    // Format as ISO 8601 (see `dateFormat` on <DateInput/> below) with no time component to avoid time zone madness
    return `${date.getFullYear()}-${date.getDate()}-${date.getMonth() + 1}`;
  }

  private handleDateInputPopupOpen = (): void => {
    this.setState({ isDatePickerOpen: true });
  };

  private handleDateInputPopupClose = (): void => {
    this.setState({ isDatePickerOpen: false });
  };

  private handleDatePicked = (_event: React.SyntheticEvent<HTMLElement>, data: any): void => {
    const updatedDate = moment(data.value).toDate();
    const updatedSeriesProps: SeriesProps = { ...this.props.seriesProps, startDate: updatedDate };

    this.setState({ isDatePickerOpen: false });
    this.props.onChanged(updatedSeriesProps);
  };

  private handleRemoved = (): void => {
    this.props.onRemoved(this.props.seriesProps);
  };

  public render(): React.ReactElement {
    const interiorPadding = 8;

    return (
      <Button.Group
        color={this.props.seriesProps.color.semanticColor}
        style={{ padding: this.props.padding }}
      >
        <Popup
          on="click"
          trigger={<Button content={this.props.seriesProps.name} />}
          // See note in `State` re: controlling open/close;
          // onOpen/onClose are called by this popup when it itself thinks it should open/close
          open={this.state.isColorPickerOpen}
          onOpen={this.handleColorPickerOpen}
          onClose={this.handleColorPickerClose}
        >
          <Popup.Content>
            {ColorPalette.map(c => {
              return (
                <Label
                  key={c.semanticColor}
                  as="a"
                  circular
                  color={c.semanticColor}
                  style={
                    // Provide subtle highlighting by scale to selected color
                    c.semanticColor === this.props.seriesProps.color.semanticColor
                      ? { transform: `scale(0.75, 0.75)` }
                      : undefined
                  }
                  onClick={() => this.handleColorChanged(c)}
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
                (this.props.isSingleDay ? "on" : "beginning") +
                " " +
                moment(this.props.seriesProps.startDate).format("ll")
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
              dateFormat="YYYY-MM-DD" // ISO 8601 so it auto-parses
              value={this.toDateInputString(this.props.seriesProps.startDate)}
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

export default ExploreSeriesBean;
