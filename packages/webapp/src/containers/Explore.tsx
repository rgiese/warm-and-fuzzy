import React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Container, Dropdown, DropdownProps, Message, Segment } from "semantic-ui-react";
import { observer } from "mobx-react";
import moment from "moment";

import Plot from "../components/explore/Plot";
import SeriesInstanceBean from "../components/explore/SeriesInstanceBean";
import { SeriesInstanceDateFormat } from "../components/explore/SeriesInstanceProps";
import Timezone, { Timezones } from "../stores/explore/Timezone";
import ViewSpan, { ViewSpans, viewSpanToDays } from "../stores/explore/ViewSpan";

import RootStore from "../stores";
import ExploreStore from "../stores/explore";

interface Props extends RouteComponentProps {
  rootStore: RootStore;
  exploreStore: ExploreStore;
}

class State {
  public constructor() {
    this.haveParsedURLParams = false;
    this.lastURLParams = undefined;
  }

  haveParsedURLParams: boolean;
  lastURLParams?: string;
}

@observer
class Explore extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = new State();
  }

  async componentDidMount(): Promise<void> {
    // Parse URL params
    // ExploreState.FromSearchParams(
    //   this.props.location.search,
    //   viewSpan => (this.props.store.viewSpan = viewSpan),
    //   timezone => (this.props.store.timezone = timezone),
    //   this.addSeriesInstance
    // );
    // this.setState({ haveParsedURLParams: true });
  }

  componentDidUpdate(): void {
    // if (this.state.haveParsedURLParams) {
    //   // Consider updating URL search params
    //   const urlParamsString = ExploreState.ToSearchParams(
    //     this.props.store.viewSpan,
    //     this.props.store.timezone,
    //     this.state.seriesInstanceProps
    //   );
    //   if (urlParamsString !== this.state.lastURLParams) {
    //     this.setState({ lastURLParams: urlParamsString });
    //     this.props.history.push({ search: "?" + urlParamsString });
    //   }
    // }
  }

  private handleSeriesInstanceAdded = (
    _event: React.SyntheticEvent<HTMLElement>,
    data: DropdownProps
  ): void => {
    const streamName = data.value as string; // see Dropdown key definition below

    // Default the start date to the beginning of the period ending with today
    const startDate = moment()
      .subtract(viewSpanToDays(this.props.exploreStore.viewSpan) - 1, "days")
      .format(SeriesInstanceDateFormat);

    this.props.exploreStore.addSeriesInstance(streamName, startDate);
  };

  public render(): React.ReactElement {
    const exploreStore = this.props.exploreStore;
    const thermostatConfigurationStore = this.props.rootStore.thermostatConfigurationStore;

    return (
      <Container>
        {thermostatConfigurationStore.state === "error" && (
          <Message negative content={thermostatConfigurationStore.error} />
        )}
        <Segment>
          {/* View settings */}
          Show data for a{` `}
          <Dropdown
            inline
            header="Choose time span"
            options={ViewSpans.map(v => {
              return { key: v, value: v, text: v };
            })}
            value={exploreStore.viewSpan}
            onChange={(_event, data) => exploreStore.setViewSpan(data.value as ViewSpan)}
          />
          by{` `}
          <Dropdown
            inline
            header="Choose time zone"
            options={Timezones.map(tz => {
              return { key: tz, value: tz, text: tz };
            })}
            value={exploreStore.timezone}
            onChange={(_event, data) => exploreStore.setTimezone(data.value as Timezone)}
          />
          time.
        </Segment>
        <Container style={{ height: "40em" /* TODO: flexbox this */ }}>
          <Plot store={exploreStore} />
        </Container>
        <Container>
          {/* Series instance beans */}
          {exploreStore.seriesInstanceProps.map(series => (
            <SeriesInstanceBean
              key={series.instanceId}
              store={exploreStore}
              seriesInstanceProps={series}
              padding={6}
            />
          ))}
          {/* Add series instance button */}
          <Dropdown
            style={{ padding: 12 }}
            button
            className="icon"
            icon="add"
            labeled
            loading={thermostatConfigurationStore.state === "fetching"}
            text="Add series"
            search
            options={thermostatConfigurationStore.thermostatConfigurations.map(config => {
              return { key: config.streamName, value: config.streamName, text: config.name };
            })}
            onChange={this.handleSeriesInstanceAdded}
            value="" // Control component so selecting the same item twice in a row still triggers `onChange`
          />
        </Container>
      </Container>
    );
  }
}

export default withRouter(Explore);
