export interface AuthProvider {
  //
  // Web:
  // - requestLogin: will redirect to Auth0 page, returns undefined
  // - completeLogin: called on callback page, returns auth status
  //
  // Mobile:
  // - requestLogin: end-to-end flow, returns auth status
  // - completeLogin: no-op
  //

  requestLogin: () => Promise<boolean | undefined>;
  completeLogin: () => Promise<boolean>;

  requestLogout: () => Promise<void>;
}
