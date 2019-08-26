import React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Container, Dropdown, DropdownProps, Message, Segment } from "semantic-ui-react";
import moment from "moment";

import * as ExploreState from "../components/explore/ExploreState";
import SeriesColorPalette from "../components/explore/SeriesColorPalette";
import SeriesIdentifier from "../components/explore/SeriesIdentifier";
import SeriesInstanceBean from "../components/explore/SeriesInstanceBean";
import SeriesInstanceProps, {
  SeriesInstanceDateFormat,
} from "../components/explore/SeriesInstanceProps";

import Plot, {
  ViewSpan,
  ViewSpans,
  viewSpanToDays,
  Timezone,
  Timezones,
} from "../components/explore/Plot";

import gql from "graphql-tag";
import {
  ExploreThermostatConfigurationsDocument,
  ExploreThermostatConfigurationsQuery,
} from "../generated/graphqlClient";
import ApolloClient from "../services/ApolloClient";

gql`
  query ExploreThermostatConfigurations {
    getThermostatConfigurations {
      id
      name
      streamName
    }
  }
`;

interface Props extends RouteComponentProps {}

class State implements ExploreState.State {
  public constructor() {
    this.viewSpan = ViewSpan.Day;
    this.timezone = Timezone.Local;

    this.seriesInstanceProps = [];

    this.haveParsedURLParams = false;
  }

  viewSpan: ViewSpan;
  timezone: Timezone;

  availableSeries?: SeriesIdentifier[];
  seriesInstanceProps: SeriesInstanceProps[];

  errors?: string;

  haveParsedURLParams: boolean;
  lastURLParams?: string;
}

class Explore extends React.Component<Props, State> {
  private nextSeriesInstanceId: number;

  public constructor(props: Props) {
    super(props);
    this.state = new State();
    this.nextSeriesInstanceId = 0;
  }

  async componentDidMount(): Promise<void> {
    // Obtain thermostat configuration
    let availableSeries: SeriesIdentifier[];

    try {
      const queryResult = await ApolloClient.query<ExploreThermostatConfigurationsQuery, {}>({
        query: ExploreThermostatConfigurationsDocument,
      });

      if (queryResult.errors) {
        this.setState({ errors: JSON.stringify(queryResult.errors) });
      } else if (!queryResult.data || !queryResult.data.getThermostatConfigurations) {
        this.setState({ errors: "No data returned" });
      } else {
        availableSeries = queryResult.data.getThermostatConfigurations
          .map(s => {
            return { id: s.id, name: s.name, streamName: s.streamName };
          })
          .sort((lhs, rhs) => lhs.name.localeCompare(rhs.name));

        this.setState({ availableSeries });
      }
    } catch (error) {
      this.setState({ errors: JSON.stringify(error) });
    }

    // Parse URL params
    ExploreState.FromSearchParams(
      this.props.location.search,
      viewSpan => this.setState({ viewSpan }),
      timezone => this.setState({ timezone }),
      this.addSeriesInstance
    );

    this.setState({ haveParsedURLParams: true });
  }

  componentDidUpdate(): void {
    if (this.state.haveParsedURLParams) {
      // Consider updating URL search params
      const urlParamsString = ExploreState.ToSearchParams(this.state);

      if (urlParamsString !== this.state.lastURLParams) {
        this.setState({ lastURLParams: urlParamsString });
        this.props.history.push({ search: "?" + urlParamsString });
      }
    }
  }

  private addSeriesInstance = (
    streamName: string,
    startDate: string,
    colorIndex: number,
    shouldFailSilently: boolean = false
  ) => {
    if (!this.state.availableSeries) {
      if (!shouldFailSilently) {
        throw new Error(`Unexpected: available series should be loaded`);
      }
      return;
    }

    const instanceId = this.nextSeriesInstanceId;
    ++this.nextSeriesInstanceId;

    const seriesIdentifier = this.state.availableSeries.find(
      series => series.streamName === streamName
    );

    if (!seriesIdentifier) {
      if (!shouldFailSilently) {
        throw new Error(`Unexpected: stream ${streamName} should be in available series.`);
      }
      return;
    }

    const addedSeriesInstance: SeriesInstanceProps = {
      instanceId,
      seriesIdentifier,
      colorIndex: colorIndex % SeriesColorPalette.length,
      startDate,
    };

    this.setState({
      seriesInstanceProps: [...this.state.seriesInstanceProps, addedSeriesInstance],
    });
  };

  private handleSeriesInstanceAdded = (
    _event: React.SyntheticEvent<HTMLElement>,
    data: DropdownProps
  ): void => {
    const streamName = data.value as string; // see Dropdown key definition below

    // Default the start date to the beginning of the period ending with today
    const startDate = moment()
      .subtract(viewSpanToDays(this.state.viewSpan) - 1, "days")
      .format(SeriesInstanceDateFormat);

    this.addSeriesInstance(streamName, startDate, this.nextSeriesInstanceId);
  };

  private handleSeriesInstanceChanged = (data: SeriesInstanceProps): void => {
    let seriesInstanceProps = this.state.seriesInstanceProps;

    const changedSeriesIndex = seriesInstanceProps.findIndex(
      series => series.instanceId === data.instanceId
    );
    seriesInstanceProps[changedSeriesIndex] = data;

    this.setState({ seriesInstanceProps: seriesInstanceProps });
  };

  private handleSeriesInstanceRemoved = (data: SeriesInstanceProps): void => {
    let seriesProps = this.state.seriesInstanceProps;

    const removedSeriesInstanceIndex = seriesProps.findIndex(
      series => series.instanceId === data.instanceId
    );
    seriesProps.splice(removedSeriesInstanceIndex, 1);

    this.setState({ seriesInstanceProps: seriesProps });
  };

  public render(): React.ReactElement {
    return (
      <Container>
        {this.state.errors && <Message negative content={this.state.errors} />}
        <Segment>
          {/* View settings */}
          Show data for a{` `}
          <Dropdown
            inline
            header="Choose time span"
            options={ViewSpans.map(v => {
              return { key: v, value: v, text: v };
            })}
            value={this.state.viewSpan}
            onChange={(_event, data) => this.setState({ viewSpan: data.value as ViewSpan })}
          />
          by{` `}
          <Dropdown
            inline
            header="Choose time zone"
            options={Timezones.map(tz => {
              return { key: tz, value: tz, text: tz };
            })}
            value={this.state.timezone}
            onChange={(_event, data) => this.setState({ timezone: data.value as Timezone })}
          />
          time.
        </Segment>
        <Container style={{ height: "40em" /* TODO: flexbox this */ }}>
          <Plot
            seriesInstanceProps={this.state.seriesInstanceProps}
            viewSpan={this.state.viewSpan}
            timezone={this.state.timezone}
          />
        </Container>
        <Container>
          {/* Series instance beans */}
          {this.state.seriesInstanceProps.map(series => (
            <SeriesInstanceBean
              key={series.instanceId}
              seriesInstanceProps={series}
              onChanged={this.handleSeriesInstanceChanged}
              onRemoved={this.handleSeriesInstanceRemoved}
              showingSingleDay={this.state.viewSpan === ViewSpan.Day}
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
            loading={!this.state.availableSeries}
            text="Add series"
            search
            options={
              this.state.availableSeries
                ? this.state.availableSeries.map(s => {
                    return { key: s.streamName, value: s.streamName, text: s.name };
                  })
                : []
            }
            onChange={this.handleSeriesInstanceAdded}
            value="" // Control component so selecting the same item twice in a row still triggers `onChange`
          />
        </Container>
      </Container>
    );
  }
}

export default withRouter(Explore);
