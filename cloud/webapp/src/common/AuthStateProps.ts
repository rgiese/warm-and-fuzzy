export default interface AuthStateProps {
  isAuthenticated: boolean;
  setUserHasAuthenticated(authenticated: boolean): void;
}
