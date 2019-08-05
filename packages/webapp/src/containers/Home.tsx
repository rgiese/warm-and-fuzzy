import React from "react";

import AuthStateProps from "../common/AuthStateProps";

import LatestActions from "../components/LatestActions";
import LatestValues from "../components/LatestValues";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props extends AuthStateProps {}

class State {}

class Home extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = new State();
  }

  private renderLander(): React.ReactElement {
    return <div>Please log in via nav bar.</div>;
  }

  private renderContent(): React.ReactElement {
    return (
      <>
        <h1>Latest actions</h1>
        <LatestActions />
        <h1>Latest values</h1>
        <LatestValues />
      </>
    );
  }

  public render(): React.ReactElement {
    return (
      <div className="pv4">
        {this.props.isAuthenticated ? this.renderContent() : this.renderLander()}
      </div>
    );
  }
}

export default Home;
