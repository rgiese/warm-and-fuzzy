import React from "react";
import { Icon, Grid, Menu } from "semantic-ui-react";

const Footer: React.FunctionComponent<{}> = (): React.ReactElement => (
  <Menu fixed="bottom" inverted color="grey">
    <Menu.Item style={{ width: "100%" }}>
      <Grid columns="equal" divided textAlign="center" style={{ width: "100%" }}>
        <Grid.Column>©{new Date().getFullYear()} All rights reserved.</Grid.Column>
        <Grid.Column>
          Made with <Icon name="heart" style={{ paddingLeft: "0.25rem", paddingRight: "1rem" }} />{" "}
          in Seattle by
          <a
            href="https://www.grumpycorp.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ paddingLeft: "0.25rem" }}
            className="link"
          >
            GrumpyCorp
          </a>
          .
        </Grid.Column>
        <Grid.Column>
          <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/" className="link">
            CC-BY-SA-4.0
          </a>
        </Grid.Column>
      </Grid>
    </Menu.Item>
  </Menu>
);

export default Footer;
