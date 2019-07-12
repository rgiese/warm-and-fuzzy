import React from "react";

import { ReactComponent as Heart } from "../assets/heart.svg";
import { ReactComponent as GrumpyCorp } from "../assets/grumpycorp-name.svg";

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
    . Made with <Heart className="v-mid w1 h1" /> in Seattle by{" "}
    <a
      className="link dim"
      href="https://www.grumpycorp.com"
      target="_blank"
      rel="noopener noreferrer"
    >
      <GrumpyCorp className="v-bottom h075" />
    </a>
    .
  </footer>
);

export default Footer;
