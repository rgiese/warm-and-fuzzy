import React from "react";
import { Link } from "react-router-dom";

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

    return (
      <nav className="cf pv2 bg-accent-mono-light sans">
        <div className="fl dib pl2">
          {/*** Logo ***/}
          <div className="dib ph1 ph2-ns">
            <GrumpyBird className="v-mid w2 h2 pr2" />
            <Link className="link dim" to="/">
              Home {tenant ? ` - ${tenant}` : ``}
            </Link>
          </div>
        </div>

        <div className="fr dib ph3">
          {/*** Prod/dev indicator ***/}
          <span className="f5 accent">
            {Config.isProduction ? `` : `[stage: ${ConfigStageName}]`}
          </span>

          {/*** Login/logout ***/}
          <div className="dib ph1 ph2-ns">
            {!this.props.isAuthenticated ? (
              <button className="link dim f5 black-80" onClick={this.handleLogin}>
                Log in
              </button>
            ) : (
              <button className="link dim f5 black-80" onClick={this.handleLogout}>
                Log out {userName ? userName.split(" ")[0] : ""}
              </button>
            )}
          </div>
        </div>
      </nav>
    );
  }
}

export default Header;
