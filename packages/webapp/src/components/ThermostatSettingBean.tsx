import React from "react";
import { Button, Icon } from "semantic-ui-react";
import { observer } from "mobx-react";

import * as GraphQL from "../generated/graphqlClient";

import { ThermostatSetting } from "@grumpycorp/warm-and-fuzzy-shared-client";

const ThermostatSettingBean: React.FunctionComponent<{ thermostatSetting: ThermostatSetting }> = ({
  thermostatSetting,
}): React.ReactElement => {
  const interiorPadding = 10;

  const isHeatAllowed = thermostatSetting.allowedActions.includes(GraphQL.ThermostatAction.Heat);
  const isCoolAllowed = thermostatSetting.allowedActions.includes(GraphQL.ThermostatAction.Cool);
  const isCirculateAllowed = thermostatSetting.allowedActions.includes(
    GraphQL.ThermostatAction.Circulate
  );

  const formatTemperature = (temperature: number): React.ReactFragment => <>{temperature} &deg;C</>;

  const inactiveIcon = <Icon name="window minimize outline" />;

  // TODO: Gate actions on availability from configuration
  return (
    <Button.Group style={{ padding: 4 }}>
      <Button style={{ paddingLeft: interiorPadding, paddingRight: interiorPadding / 2 }}>
        <Icon name="arrow up" color="red" />
        {isHeatAllowed ? formatTemperature(thermostatSetting.setPointHeat) : inactiveIcon}
      </Button>

      <Button style={{ paddingLeft: interiorPadding / 2, paddingRight: interiorPadding / 2 }}>
        <Icon name="arrow down" color="blue" />
        {isCoolAllowed ? formatTemperature(thermostatSetting.setPointCool) : inactiveIcon}
      </Button>

      <Button style={{ paddingLeft: interiorPadding / 2, paddingRight: interiorPadding / 2 }}>
        <Icon name="sync alternate" color="purple" />
        {isCirculateAllowed ? <Icon name="check" /> : inactiveIcon}
      </Button>

      {thermostatSetting.type === GraphQL.ThermostatSettingType.Hold && (
        <Button
          content={`until ${thermostatSetting.holdUntil?.toISOString()}`}
          style={{ paddingLeft: interiorPadding / 2, paddingRight: interiorPadding / 2 }}
        />
      )}

      {thermostatSetting.type === GraphQL.ThermostatSettingType.Scheduled &&
        thermostatSetting.atMinutesSinceMidnight && (
          <Button
            content={`at ${String(
              Math.floor(thermostatSetting.atMinutesSinceMidnight / 60)
            ).padStart(2, "0")}:${String(
              Math.round(thermostatSetting.atMinutesSinceMidnight % 60)
            ).padStart(2, "0")}`}
            style={{ paddingLeft: interiorPadding / 2, paddingRight: interiorPadding / 2 }}
          />
        )}

      <Button
        style={{
          paddingLeft: interiorPadding,
          paddingRight: interiorPadding,
          opacity: 0.8,
        }}
        icon="remove"
      />
    </Button.Group>
  );
};

export default observer(ThermostatSettingBean);
