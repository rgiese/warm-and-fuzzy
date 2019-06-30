import React from "react";
import { Link } from "react-router-dom";

import AuthStateProps from "../common/AuthStateProps";

import ApiGateway from "../services/ApiGateway";

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
      const content = await this.fetchContent();
      this.setState({ content });
    } catch (e) {
      alert(`FetchContent exception: ${e}`);
    }

    this.setState({ isLoading: false });
  }

  private async fetchContent(): Promise<string> {
    const foo = await ApiGateway("GET", "/api/v1/getConfig", undefined);
    console.log(foo);
    return foo.data;
  }

  private renderLander(): React.ReactElement {
    return (
      <div>
        Please <Link to="/login">[ log in ]</Link>.
      </div>
    );
  }

  private renderContent(): React.ReactElement {
    return <div>Your Notes!</div>;
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
