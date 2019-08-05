export namespace Authorization {
  // Keys: align with schema/schema.graphql#RequiredPermission
  // Values: defined in Auth0 API settings
  // Mappings: see api/src/graphql/requiresPermissionDirective.ts
  export enum Permissions {
    ReadData = "read:data",
    ReadConfig = "read:config",
    WriteConfig = "write:config",
    CrossTenantAdmin = "xtenant",
  }
}

export namespace AuthenticationConfiguration {
  export const Domain = "grumpycorp.auth0.com";
  export const Audience = "https://api.warmandfuzzy.house";
  export const CustomClaimsNamespace = "https://warmandfuzzy.house/";
}
