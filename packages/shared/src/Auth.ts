export namespace Authorization {
  // Keys: align with schema/schema.graphql#RequiredPermission
  // Values: defined in Auth0 API settings
  // Mappings: see api/src/graphql/requiresPermissionDirective.ts
  export enum Permissions {
    ReadData = "read:data",
    ReadConfig = "read:config",
    WriteConfig = "write:config",
    ReadSettings = "read:settings",
    WriteSettings = "write:settings",
    CrossTenantAdmin = "xtenant",
  }
}

export namespace AuthenticationConfiguration {
  export const Domain = "grumpycorp.auth0.com";
  export const Audience = "https://api.warmandfuzzy.house";
  export const CustomClaimsNamespace = "https://warmandfuzzy.house/";
  export const CustomClaims = {
    // Id token
    UserName: "user_name",
    UserEmail: "user_email",
    UnitsPreferences: "units_prefs",
    // Access token
    Tenant: "tenant",
  };

  export const ClientId = "d2iox6iU52feMZVugq4GIiu0A4wKe70J";
}
