import { Container, Divider, Header } from "semantic-ui-react";

import LatestSensorValues from "../components/LatestSensorValues";
import LatestThermostatValues from "../components/LatestThermostatValues";
import React from "react";
import { observer } from "mobx-react";
import { useRootStore } from "@grumpycorp/warm-and-fuzzy-shared-client";

function Home(): React.ReactElement {
  const authStore = useRootStore().authStore;

  if (authStore.isUserAuthenticated) {
    return (
      <Container text>
        <Divider horizontal>
          <Header as="h4">Thermostats</Header>
        </Divider>
        <LatestThermostatValues />

        <Divider horizontal style={{ paddingTop: "2em" }}>
          <Header as="h4">Sensors</Header>
        </Divider>
        <LatestSensorValues />
      </Container>
    );
  } else {
    // TODO: Make this a live link.
    return <div>Please log in via nav bar.</div>;
  }
}

export default observer(Home);
