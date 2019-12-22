import React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Container, Dropdown, DropdownProps, Segment } from "semantic-ui-react";
import { observer } from "mobx-react";
import moment from "moment";

import { RootStoreContext } from "@grumpycorp/warm-and-fuzzy-shared-client";

import Plot from "../components/explore/Plot";
import SeriesInstanceBean from "../components/explore/SeriesInstanceBean";
import { SeriesInstanceDateFormat } from "../stores/explore/SeriesInstanceProps";
import Timezone, { Timezones } from "../stores/explore/Timezone";
import ViewSpan, { ViewSpans, viewSpanToDays } from "../stores/explore/ViewSpan";

import ExploreStore from "../stores/explore";
import ExplorePlotDataStore from "../stores/explore-plot-data";

import * as StoreChecks from "../components/StoreChecks";

interface Props extends RouteComponentProps {
  exploreStore: ExploreStore;
  explorePlotDataStore: ExplorePlotDataStore;
}

class State {}

@observer
class Explore extends React.Component<Props, State> {
  static contextType = RootStoreContext;
  context!: React.ContextType<typeof RootStoreContext>;

  private haveParsedURLParams: boolean = false;
  private lastURLParams: string = "";

  public constructor(props: Props) {
    super(props);
    this.state = new State();
  }

  async componentDidMount(): Promise<void> {
    // Parse URL params
    this.props.exploreStore.fromURLString(this.props.location.search);

    // Update URL as needed
    const urlParamsString = this.props.exploreStore.toURLString();
    this.lastURLParams = urlParamsString;

    if (urlParamsString !== this.props.location.search) {
      this.props.history.replace({ search: urlParamsString });
    }

    this.haveParsedURLParams = true;
  }

  componentDidUpdate(): void {
    if (this.haveParsedURLParams) {
      // Update URL as needed
      const urlParamsString = this.props.exploreStore.toURLString();

      if (urlParamsString !== this.lastURLParams) {
        this.lastURLParams = urlParamsString;

        if (urlParamsString !== this.props.location.search) {
          this.props.history.push({ search: urlParamsString });
        }
      }
    }
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
    const rootStore = this.context.rootStore;

    const exploreStore = this.props.exploreStore;
    const thermostatConfigurationStore = rootStore.thermostatConfigurationStore;

    const storeDependencies = [thermostatConfigurationStore];

    if (!StoreChecks.areStoresAvailable(storeDependencies)) {
      return StoreChecks.renderStoreWorkingOrErrorComponent(storeDependencies);
    }

    return (
      <Container>
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
        <Container style={{ height: "60vh" }}>
          <Plot
            exploreStore={exploreStore}
            explorePlotDataStore={this.props.explorePlotDataStore}
          />
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
            loading={thermostatConfigurationStore.isWorking}
            text="Add series"
            search
            options={thermostatConfigurationStore.data.map(config => {
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

// https://github.com/facebook/react/issues/14061
function withRouterWorkaround<P extends RouteComponentProps<any>>(Inner: React.ComponentType<P>) {
  const Wrapped: React.FunctionComponent<P> = (props: P) => <Inner {...props} />;
  Wrapped.displayName = `WithRouterWorkaround(${Inner.displayName || Inner.name || "?"})`;
  return withRouter(Wrapped);
}

export default withRouterWorkaround(Explore);
