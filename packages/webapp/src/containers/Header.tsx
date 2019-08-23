import React from "react";
import { NavLink } from "react-router-dom";
import { Menu } from "semantic-ui-react";

import { Authorization } from "@grumpycorp/warm-and-fuzzy-shared";

import Config, { ConfigStageName } from "../config";

import AuthStateProps from "../common/AuthStateProps";
import { GlobalAuth } from "../services/Auth";

import { ReactComponent as GrumpyBird } from "../assets/grumpy-robin.svg";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props extends AuthStateProps {}

class State {}

class Header extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = new State();
  }

  private handleLogin = (): void => {
    GlobalAuth.login();
  };

  private handleLogout = (): void => {
    GlobalAuth.logout();
  };

  public render(): React.ReactElement {
    const tenant = GlobalAuth.Tenant;
    const userName = GlobalAuth.UserName;

    const permissions = GlobalAuth.Permissions;

    return (
      <Menu fixed="top" pointing secondary style={{ backgroundColor: "white" }}>
        {/* Menu requires explicit white background color to keep items from sliding under it
        since the `secondary` style makes the menu transparent (`background 0 0`) by default */}
        <Menu.Item header style={{ paddingTop: 0, paddingBottom: 6 }}>
          <GrumpyBird style={{ width: "1.5rem", height: "1.5rem" }} />
        </Menu.Item>
        <Menu.Item as={NavLink} to="/" exact>
          {tenant || ""} Home
        </Menu.Item>
        {permissions.includes(Authorization.Permissions.WriteConfig) && (
          <Menu.Item as={NavLink} to="/configuration" content="Configuration" />
        )}
        <Menu.Menu position="right">
          {!Config.isProduction && <Menu.Item header>Stage: {ConfigStageName}</Menu.Item>}
          {!this.props.isAuthenticated ? (
            <Menu.Item name="login" onClick={this.handleLogin}>
              Log in
            </Menu.Item>
          ) : (
            <Menu.Item name="logout" onClick={this.handleLogout}>
              {" "}
              Log out {userName ? userName.split(" ")[0] : ""}
            </Menu.Item>
          )}
        </Menu.Menu>
      </Menu>
    );
  }
}

export default Header;
