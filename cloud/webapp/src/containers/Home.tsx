import React from "react";

import AuthStateProps from "../common/AuthStateProps";

import ConfigApi from "../services/ConfigApi";

import ThermostatConfigs from "../components/ThermostatConfigs";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props extends AuthStateProps {}

class State {
  public isLoading: boolean;
  public content: string;

  public constructor() {
    this.isLoading = true;
    this.content = "";
  }
}

class Home extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = new State();
  }

  public async componentDidMount(): Promise<void> {
    if (!this.props.isAuthenticated) {
      return;
    }

    try {
      const content = await ConfigApi.list();
      this.setState({ content });
    } catch (e) {
      console.log(`GET config: ${e}`);
    }

    this.setState({ isLoading: false });
  }

  private renderLander(): React.ReactElement {
    return <div>Please log in via nav bar.</div>;
  }

  private renderContent(): React.ReactElement {
    return (
      <div>
        <ThermostatConfigs />
        <code>{JSON.stringify(this.state.content)}</code>
      </div>
    );
  }

  public render(): React.ReactElement {
    return (
      <div className="Home">
        {this.props.isAuthenticated ? this.renderContent() : this.renderLander()}
      </div>
    );
  }
}

export default Home;
