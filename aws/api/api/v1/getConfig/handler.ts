import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { DataMapper } from "@aws/dynamodb-data-mapper";
import { attribute, hashKey, rangeKey, table } from "@aws/dynamodb-data-mapper-annotations";
import "source-map-support/register";

import Authorizations, { UnauthorizedResponse } from "../../auth/Authorizations";

// See https://github.com/awslabs/dynamodb-data-mapper-js

@table("ThermostatConfig")
class ThermostatConfiguration {
  public constructor() {
    this.tenant = "";
    this.deviceId = "";

    this.setPointHeat = NaN;
    this.setPointCool = NaN;
    this.threshold = NaN;
    this.cadence = NaN;
    this.allowedActions = "";
  }

  /**
   * @name ThermostatConfiguration#deviceId
   *
   * Tenant (assigned by WarmAndFuzzy)
   */
  @hashKey()
  public tenant: string;

  /**
   * @name ThermostatConfiguration#deviceId
   *
   * Device ID (assigned by Particle)
   */
  @rangeKey()
  public deviceId: string;

  /**
   * @name ThermostatConfiguration#setPointHeat
   *
   * Target temperature for heating
   * Units: Celsius
   */
  @attribute()
  public setPointHeat: number;

  /**
   * @name ThermostatConfiguration#setPointCool
   *
   * Target temperature for cooling
   * Units: Celsius
   */
  @attribute()
  public setPointCool: number;

  /**
   * @name ThermostatConfiguration#threshold
   *
   * Hysteresis threshold around targets
   * Units: Celsius
   */
  @attribute()
  public threshold: number;

  /**
   * @name ThermostatConfiguration#cadence
   *
   * Operational cadence
   * Units: seconds
   */
  @attribute()
  public cadence: number;

  /**
   * @name ThermostatConfiguration#allowedActions
   *
   * Allowed actions:
   * - heating ("H")
   * - cooling ("C")
   * - circulation ("R")
   *
   * For example: "HCR"
   *
   * May be left empty if no actions are permitted.
   */
  @attribute()
  public allowedActions: string;
}

const dbMapper = new DataMapper({ client: new DynamoDB({ region: "us-west-2" }) });

export const getConfig: APIGatewayProxyHandler = async event => {
  const authorizations = event.requestContext.authorizer as Authorizations;

  if (!authorizations.AuthorizedTenant || !authorizations.AuthorizedPermissions) {
    return UnauthorizedResponse;
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
  };

  // const testConfig = Object.assign(new ThermostatConfiguration(), {
  //   tenant: "AmazingHouse",
  //   deviceId: "test2",
  //   setPointHeat: 18.0,
  //   setPointCool: 22.5,
  //   threshold: 0.5,
  //   cadence: 120,
  //   allowedActions: "CR",
  // });

  // await dbMapper.put(testConfig);

  let configs: ThermostatConfiguration[] = [];

  for await (const config of dbMapper.query(ThermostatConfiguration, {
    tenant: authorizations.AuthorizedTenant,
  })) {
    configs.push(config);
  }

  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify(
      {
        message: `Welcome to ${authorizations.AuthorizedTenant}, you can ${
          authorizations.AuthorizedPermissions
        } over ${JSON.stringify(configs)}`,
        input: event,
      },
      null,
      2
    ),
  };
};
