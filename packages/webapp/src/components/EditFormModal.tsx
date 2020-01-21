import { Button, Form, Icon, Message, Modal } from "semantic-ui-react";
import React, { useState } from "react";

const EditFormModal: React.FunctionComponent<{
  canSave: boolean;
  error?: string | React.ReactElement;
  header: string | React.ReactElement;
  onSave(): Promise<void>;
}> = ({ canSave, error, header, onSave, children }): React.ReactElement => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  return (
    <Modal
      basic
      dimmer="inverted"
      onClose={(): void => setIsModalOpen(false)}
      open={isModalOpen}
      size="small"
      trigger={
        <Button animated="vertical" basic onClick={(): void => setIsModalOpen(true)}>
          <Button.Content hidden>Edit</Button.Content>
          <Button.Content visible>
            <Icon name="pencil" />
          </Button.Content>
        </Button>
      }
    >
      <Modal.Header>{header}</Modal.Header>
      <Modal.Content>
        <Form loading={isSaving}>{children}</Form>
      </Modal.Content>
      <Modal.Actions>
        <Button content="Cancel" icon="cancel" onClick={(): void => setIsModalOpen(false)} />
        <Button
          content={isSaving ? "Saving..." : "Save"}
          disabled={canSave}
          icon="save"
          onClick={async (): Promise<void> => {
            setIsSaving(true);

            await onSave();

            setIsSaving(false);
            setIsModalOpen(false);
          }}
          positive
        />
      </Modal.Actions>
      {error && <Message content={error} error header="Server response" />}
    </Modal>
  );
};

export default EditFormModal;
