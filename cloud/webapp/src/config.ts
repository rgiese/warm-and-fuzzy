export interface Config {
  isProduction: boolean;
  apiGateway: {
    REGION: string;
    URL: string;
  };
  cognito: {
    REGION: string;
    USER_POOL_ID: string;
    APP_CLIENT_ID: string;
    IDENTITY_POOL_ID: string;
  };
}

const Dev: Config = {
  isProduction: false,
  apiGateway: {
    REGION: "us-west-2",
    URL: "https://y7vsc717ei.execute-api.us-west-2.amazonaws.com/dev",
  },
  cognito: {
    REGION: "us-west-2",
    USER_POOL_ID: "us-west-2_Ddg9EdUYM",
    APP_CLIENT_ID: "6kpj37hocqn8fo16at7a30lkbr",
    IDENTITY_POOL_ID: "us-west-2:50346559-930f-4af9-9bb5-3dd609c36388",
  },
};

const Prod: Config = {
  isProduction: true,
  apiGateway: {
    REGION: "us-west-2",
    URL: "https://20ub3q0uol.execute-api.us-west-2.amazonaws.com/prod",
  },
  cognito: {
    REGION: "us-west-2",
    USER_POOL_ID: "us-west-2_GZv5gQREb",
    APP_CLIENT_ID: "kj7e9ug4dg4m1k7p22qr9v69m",
    IDENTITY_POOL_ID: "us-west-2:f7164c71-3f96-4470-9f52-70e97273c5a8",
  },
};

// Default to dev environment
export default process.env.WAF_API_STAGE === "prod" ? Prod : Dev;
