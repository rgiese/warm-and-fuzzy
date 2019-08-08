// TODO:
// - share
// - dispatch based on stage
export interface Config {
  isProduction: boolean;
  apiGateway: {
    REGION: string;
    URL: string;
  };
}

const configByStage: { [key: string]: Config } = {
  local: {
    isProduction: false,
    apiGateway: {
      REGION: "us-west-2",
      URL: "http://localhost:3001",
    },
  },

  dev: {
    isProduction: false,
    apiGateway: {
      REGION: "us-west-2",
      URL: "https://dev.api.warmandfuzzy.house",
    },
  },

  prod: {
    isProduction: true,
    apiGateway: {
      REGION: "us-west-2",
      URL: "https://prod.api.warmandfuzzy.house",
    },
  },
};

// Default to dev stage
export const ConfigStageName = process.env.REACT_APP_API_STAGE || "prod"; // TODO: fix me

export default configByStage[ConfigStageName];
