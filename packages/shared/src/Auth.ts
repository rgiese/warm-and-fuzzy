export namespace Authorization {
  export enum Permissions {
    ReadConfig = "read:config",
    WriteConfig = "write:config",
  }
}

export namespace AuthenticationConfiguration {
  export const Domain = "grumpycorp.auth0.com";
  export const Audience = "https://api.warmandfuzzy.house";
  export const CustomClaimsNamespace = "https://warmandfuzzy.house/";
}
