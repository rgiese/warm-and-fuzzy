import { Container, Dropdown, DropdownProps, Segment } from "semantic-ui-react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import Timezone, { Timezones } from "../stores/explore/Timezone";
import ViewSpan, { ViewSpans, viewSpanToDays } from "../stores/explore/ViewSpan";

import ExplorePlotDataStore from "../stores/explore-plot-data";
import ExploreStore from "../stores/explore";
import Plot from "../components/explore/Plot";
import React from "react";
import { RootStoreContext } from "@grumpycorp/warm-and-fuzzy-shared-client";
import SeriesInstanceBean from "../components/explore/SeriesInstanceBean";
import { SeriesInstanceDateFormat } from "../stores/explore/SeriesInstanceProps";
import StoreChecks from "../components/StoreChecks";
import moment from "moment";
import { observer } from "mobx-react";

interface Props extends RouteComponentProps {
  exploreStore: ExploreStore;
  explorePlotDataStore: ExplorePlotDataStore;
}

// eslint-disable-next-line react/require-optimization
@observer
class Explore extends React.Component<Props> {
  public static contextType = RootStoreContext;
  public context!: React.ContextType<typeof RootStoreContext>;

  private haveParsedURLParams = false;
  private lastURLParams = "";

  public componentDidMount(): void {
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

  public componentDidUpdate(): void {
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

  public render(): React.ReactElement {
    const rootStore = this.context.rootStore;

    const exploreStore = this.props.exploreStore;
    const thermostatConfigurationStore = rootStore.thermostatConfigurationStore;

    return (
      <StoreChecks requiredStores={[thermostatConfigurationStore]}>
        <Container>
          <Segment>
            {/* View settings */}
            Show data for a
            <Dropdown
              header="Choose time span"
              inline
              onChange={(_event, data): void => exploreStore.setViewSpan(data.value as ViewSpan)}
              options={ViewSpans.map(v => {
                return { key: v, value: v, text: v };
              })}
              value={exploreStore.viewSpan}
            />
            by
            <Dropdown
              header="Choose time zone"
              inline
              onChange={(_event, data): void => exploreStore.setTimezone(data.value as Timezone)}
              options={Timezones.map(tz => {
                return { key: tz, value: tz, text: tz };
              })}
              value={exploreStore.timezone}
            />
            time.
          </Segment>
          <Container style={{ height: "60vh" }}>
            <Plot
              explorePlotDataStore={this.props.explorePlotDataStore}
              exploreStore={exploreStore}
            />
          </Container>
          <Container>
            {/* Series instance beans */}
            {exploreStore.seriesInstanceProps.map(series => (
              <SeriesInstanceBean
                key={series.instanceId}
                padding={6}
                seriesInstanceProps={series}
                store={exploreStore}
              />
            ))}
            {/* Add series instance button */}
            <Dropdown
              button
              className="icon"
              icon="add"
              labeled
              loading={thermostatConfigurationStore.isWorking}
              onChange={this.handleSeriesInstanceAdded}
              options={thermostatConfigurationStore.data.map(config => {
                return { key: config.streamName, value: config.streamName, text: config.name };
              })}
              search
              style={{ padding: 12 }}
              text="Add series"
              value="" // Control component so selecting the same item twice in a row still triggers `onChange`
            />
          </Container>
        </Container>
      </StoreChecks>
    );
  }

  private readonly handleSeriesInstanceAdded = (
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
}

/* eslint-disable @typescript-eslint/explicit-function-return-type,react/no-multi-comp */

// https://github.com/facebook/react/issues/14061
function withRouterWorkaround<TProps extends RouteComponentProps<any>>(
  Inner: React.ComponentType<TProps>
) {
  const Wrapped: React.FunctionComponent<TProps> = (props: TProps) => <Inner {...props} />;
  Wrapped.displayName = `WithRouterWorkaround(${Inner.displayName ?? (Inner.name || "?")})`;
  return withRouter(Wrapped);
}

export default withRouterWorkaround(Explore);
