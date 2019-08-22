import React from "react";
import { Button, Form, Icon, Message, Modal } from "semantic-ui-react";

interface Props {
  canSave: boolean;
  onSave(): Promise<void>;
  header: string | React.ReactElement;
  error?: string | React.ReactElement;
}

class State {
  constructor() {
    this.isModalOpen = false;
    this.isSaving = false;
  }

  isModalOpen: boolean;
  isSaving: boolean;
}

class EditFormModal extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = new State();
  }

  handleOpen = (): void => {
    this.setState({ isModalOpen: true });
  };

  handleClose = (): void => {
    this.setState({ isModalOpen: false });
  };

  public render(): React.ReactElement {
    return (
      <Modal
        open={this.state.isModalOpen}
        trigger={
          <Button animated="vertical" basic onClick={this.handleOpen}>
            <Button.Content hidden>Edit</Button.Content>
            <Button.Content visible>
              <Icon name="pencil" />
            </Button.Content>
          </Button>
        }
        onClose={this.handleClose}
        basic
        dimmer="inverted"
        size="small"
      >
        <Modal.Header>{this.props.header}</Modal.Header>
        <Modal.Content>
          <Form loading={this.state.isSaving}>{this.props.children}</Form>
        </Modal.Content>
        <Modal.Actions>
          <Button icon="cancel" content="Cancel" onClick={this.handleClose} />
          <Button
            icon="save"
            content={this.state.isSaving ? "Saving..." : "Save"}
            positive
            disabled={this.props.canSave}
            onClick={async (): Promise<void> => {
              this.setState({ isSaving: true });
              await this.props.onSave();
              this.setState({ isSaving: false });
              this.handleClose();
            }}
          />
        </Modal.Actions>
        {this.props.error && <Message error header="Server response" content={this.props.error} />}
      </Modal>
    );
  }
}

export default EditFormModal;
