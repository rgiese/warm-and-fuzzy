import { Grid, Icon, Menu } from "semantic-ui-react";

import React from "react";

function Footer(): React.ReactElement {
  return (
    <Menu color="grey" fixed="bottom" inverted>
      <Menu.Item style={{ width: "100%" }}>
        <Grid columns="equal" divided style={{ width: "100%" }} textAlign="center">
          <Grid.Column>©{new Date().getFullYear()} All rights reserved.</Grid.Column>
          <Grid.Column>
            Made with <Icon name="heart" style={{ paddingLeft: "0.25rem", paddingRight: "1rem" }} />{" "}
            in Seattle by
            <a
              className="link"
              href="https://www.grumpycorp.com"
              rel="noopener noreferrer"
              style={{ paddingLeft: "0.25rem" }}
              target="_blank"
            >
              GrumpyCorp
            </a>
            .
          </Grid.Column>
          <Grid.Column>
            <a className="link" href="http://creativecommons.org/licenses/by-sa/4.0/" rel="license">
              CC-BY-SA-4.0
            </a>
          </Grid.Column>
        </Grid>
      </Menu.Item>
    </Menu>
  );
}

export default Footer;
