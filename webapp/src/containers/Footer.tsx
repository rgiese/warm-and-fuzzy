import React from "react";

const Footer: React.FunctionComponent<{}> = (): React.ReactElement => (
  <footer className="tc pa3 mt4 black-60 bg-accent-mono-light">
    ©{new Date().getFullYear()} All rights reserved.
    {` `}
    <a
      className="link accent dim"
      rel="license"
      href="http://creativecommons.org/licenses/by-sa/4.0/"
    >
      CC-BY-SA-4.0
    </a>
    . Made with love in Seattle.
  </footer>
);

export default Footer;
