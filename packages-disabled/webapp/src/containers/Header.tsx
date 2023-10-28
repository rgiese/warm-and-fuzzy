import Config, { ConfigStageName } from "../config";

import { Authorization } from "@grumpycorp/warm-and-fuzzy-shared";
import { ReactComponent as GrumpyBird } from "../assets/grumpy-robin.svg";
import { Menu } from "semantic-ui-react";
import { NavLink } from "react-router-dom";
import React from "react";
import { observer } from "mobx-react";
import { useRootStore } from "@grumpycorp/warm-and-fuzzy-shared-client";

function Header(): React.ReactElement {
  const authStore = useRootStore().authStore;

  const menuBackgroundColor = "white";

  return (
    <Menu fixed="top" pointing secondary style={{ backgroundColor: menuBackgroundColor }}>
      {/* Menu requires explicit white background color to keep items from sliding under it
        since the `secondary` style makes the menu transparent (`background 0 0`) by default */}
      <Menu.Item header style={{ paddingTop: 0, paddingBottom: 6 }}>
        <GrumpyBird style={{ width: "1.5rem", height: "1.5rem" }} />
      </Menu.Item>
      <Menu.Item as={NavLink} exact to="/">
        {authStore.tenant ?? ""} Home
      </Menu.Item>
      {authStore.userPermissions.includes(Authorization.Permissions.ReadSettings) && (
        <Menu.Item as={NavLink} content="Thermostat Settings" to="/settings" />
      )}
      {authStore.userPermissions.includes(Authorization.Permissions.ReadConfig) && (
        <Menu.Item as={NavLink} content="System Configuration" to="/configuration" />
      )}
      {authStore.userPermissions.includes(Authorization.Permissions.ReadData) && (
        <Menu.Item as={NavLink} content="Explore" to="/explore" />
      )}
      {authStore.isUserAuthenticated && (
        <Menu.Item as={NavLink} content="Preferences" to="/preferences" />
      )}
      <Menu.Menu position="right">
        {!Config.isProduction && <Menu.Item header>Stage: {ConfigStageName}</Menu.Item>}
        {!authStore.isUserAuthenticated ? (
          <Menu.Item
            name="login"
            onClick={async (): Promise<boolean | undefined> =>
              authStore.authProvider.requestLogin()
            }
          >
            Log in
          </Menu.Item>
        ) : (
          <Menu.Item
            name="logout"
            onClick={async (): Promise<void> => authStore.authProvider.requestLogout()}
          >
            Log out {authStore.userName?.split(" ")[0] ?? ""}
          </Menu.Item>
        )}
      </Menu.Menu>
    </Menu>
  );
}

export default observer(Header);
