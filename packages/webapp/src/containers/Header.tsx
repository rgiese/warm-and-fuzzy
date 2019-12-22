import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { Menu } from "semantic-ui-react";

import { observer } from "mobx-react";

import { Authorization } from "@grumpycorp/warm-and-fuzzy-shared";
import { RootStoreContext } from "@grumpycorp/warm-and-fuzzy-shared-client";

import Config, { ConfigStageName } from "../config";

import { ReactComponent as GrumpyBird } from "../assets/grumpy-robin.svg";

const Header: React.FunctionComponent<{}> = (): React.ReactElement => {
  const authStore = useContext(RootStoreContext).rootStore.authStore;

  return (
    <Menu fixed="top" pointing secondary style={{ backgroundColor: "white" }}>
      {/* Menu requires explicit white background color to keep items from sliding under it
        since the `secondary` style makes the menu transparent (`background 0 0`) by default */}
      <Menu.Item header style={{ paddingTop: 0, paddingBottom: 6 }}>
        <GrumpyBird style={{ width: "1.5rem", height: "1.5rem" }} />
      </Menu.Item>
      <Menu.Item as={NavLink} to="/" exact>
        {authStore.tenant || ""} Home
      </Menu.Item>
      {authStore.userPermissions.includes(Authorization.Permissions.ReadConfig) && (
        <Menu.Item as={NavLink} to="/configuration" content="Configuration" />
      )}
      {authStore.userPermissions.includes(Authorization.Permissions.ReadData) && (
        <Menu.Item as={NavLink} to="/explore" content="Explore" />
      )}
      <Menu.Menu position="right">
        {!Config.isProduction && <Menu.Item header>Stage: {ConfigStageName}</Menu.Item>}
        {!authStore.isUserAuthenticated ? (
          <Menu.Item name="login" onClick={() => authStore.authProvider.requestLogin()}>
            Log in
          </Menu.Item>
        ) : (
          <Menu.Item name="logout" onClick={() => authStore.authProvider.requestLogout()}>
            {" "}
            Log out {authStore.userName?.split(" ")[0] || ""}
          </Menu.Item>
        )}
      </Menu.Menu>
    </Menu>
  );
};

export default observer(Header);
