export namespace ClientConfiguration {
  export interface Configuration {
    isProduction: boolean;
    apiGateway: {
      REGION: string;
      URL: string;
    };
  }

  export const ByStage: { [key: string]: Configuration } = {
    local: {
      isProduction: false,
      apiGateway: {
        REGION: "us-west-2",
        URL: "http://localhost:3001",
      },
    },

    localAndroidEmulator: {
      isProduction: false,
      apiGateway: {
        REGION: "us-west-2",
        URL: "http://10.0.2.2:3001",
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
}
