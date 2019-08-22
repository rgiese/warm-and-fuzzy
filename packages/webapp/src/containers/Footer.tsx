import React from "react";
import { Icon, Menu } from "semantic-ui-react";

const Footer: React.FunctionComponent<{}> = (): React.ReactElement => (
  <Menu fixed="bottom" inverted color="grey">
    <Menu.Item>©{new Date().getFullYear()} All rights reserved.</Menu.Item>
    <Menu.Item>
      <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">
        CC-BY-SA-4.0
      </a>
    </Menu.Item>
    <Menu.Item>
      Made with <Icon name="heart" style={{ paddingLeft: "0.25rem", paddingRight: "1rem" }} /> in
      Seattle by
      <a
        href="https://www.grumpycorp.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{ paddingLeft: "0.25rem" }}
      >
        GrumpyCorp
      </a>
      .
    </Menu.Item>
  </Menu>
);

export default Footer;
