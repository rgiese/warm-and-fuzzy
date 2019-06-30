import React from "react";
import { Link } from "react-router-dom";
import { Auth } from "aws-amplify";
import ApiGatewayClientFactory from "aws-api-gateway-client";

import config from "../config";

import AuthStateProps from "../common/AuthStateProps";

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
      alert(e);
    }

    this.setState({ isLoading: false });
  }

  private async fetchContent(): Promise<string> {
    const currentUserCredentials = await Auth.currentUserCredentials();
    console.log(currentUserCredentials);

    // const amplifyData = await API.get("warm-and-fuzzy-api", "/api/v1/getConfigOpen", {
    //   //headers: { Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}` }
    // });

    var apigClient = ApiGatewayClientFactory.newClient({
      //apiKey: argv.apiKey,
      accessKey: currentUserCredentials.accessKeyId,
      secretKey: currentUserCredentials.secretAccessKey,
      sessionToken: currentUserCredentials.sessionToken,
      region: config.apiGateway.REGION,
      invokeUrl: config.apiGateway.URL,
    });

    const result = await apigClient.invokeApi({}, "/api/v1/getConfig", "GET", {}, {});

    return result;
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
