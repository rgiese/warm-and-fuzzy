interface Auth0Config {
  callbackRoute: string;
}

export interface Config {
  isProduction: boolean;
  auth0: Auth0Config;
  apiGateway: {
    REGION: string;
    URL: string;
  };
}

const CommonAuth0Config: Auth0Config = {
  callbackRoute: "/callback",
};

const configByStage: { [key: string]: Config } = {
  local: {
    isProduction: false,
    auth0: CommonAuth0Config,
    apiGateway: {
      REGION: "us-west-2",
      URL: "http://localhost:3001",
    },
  },

  dev: {
    isProduction: false,
    auth0: CommonAuth0Config,
    apiGateway: {
      REGION: "us-west-2",
      URL: "https://dev.api.warmandfuzzy.house",
    },
  },

  prod: {
    isProduction: true,
    auth0: CommonAuth0Config,
    apiGateway: {
      REGION: "us-west-2",
      URL: "https://prod.api.warmandfuzzy.house",
    },
  },
};

// Default to dev stage
export const ConfigStageName = process.env.REACT_APP_API_STAGE || "dev";

export default configByStage[ConfigStageName];
