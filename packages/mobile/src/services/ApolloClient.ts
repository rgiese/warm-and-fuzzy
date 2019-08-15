import { ApolloClient } from "apollo-client";
import { InMemoryCache, IdGetterObj, defaultDataIdFromObject } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http";
import { setContext } from "apollo-link-context";

import { SensorConfiguration, DeviceAction, SensorValue, ThermostatConfiguration } from "../../generated/graphqlClient";

import config from "../config";

import { GlobalAuth } from "./Auth";

const apolloHttpLink = createHttpLink({ uri: `${config.apiGateway.URL}/graphql` });

const apolloAuthContextLink = setContext((_, { headers }): any => {
  return {
    headers: {
      ...headers,
      authorization: GlobalAuth.IsAuthenticated ? `Bearer ${GlobalAuth.AccessToken}` : "",
    },
  };
});

const apolloCache = new InMemoryCache({
  dataIdFromObject: (object: IdGetterObj): string | null | undefined => {
    switch (object.__typename) {
      // Sensors
      case "SensorConfiguration": return "sensorConfiguration:" + (object as SensorConfiguration).sensorId;
      case "SensorValue": return "sensorValue:" + (object as SensorValue).sensorId;
      // Thermostats
      case "ThermostatConfiguration": return "thermostatConfiguration:" + (object as ThermostatConfiguration).deviceId;
      case "DeviceAction": return "deviceAction:" + (object as DeviceAction).deviceId;
      // Defaults
      default: return defaultDataIdFromObject(object);
    }
  }
});

const apolloClient = new ApolloClient({
  cache: apolloCache,
  link: apolloAuthContextLink.concat(apolloHttpLink),
});

export default apolloClient;
