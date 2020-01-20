import React, { useState } from "react";
import { Button, Form, Icon, Message, Modal } from "semantic-ui-react";

const EditFormModal: React.FunctionComponent<{
  canSave: boolean;
  onSave(): Promise<void>;
  header: string | React.ReactElement;
  error?: string | React.ReactElement;
}> = ({ canSave, onSave, header, error, children }): React.ReactElement => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  return (
    <Modal
      open={isModalOpen}
      trigger={
        <Button animated="vertical" basic onClick={() => setIsModalOpen(true)}>
          <Button.Content hidden>Edit</Button.Content>
          <Button.Content visible>
            <Icon name="pencil" />
          </Button.Content>
        </Button>
      }
      onClose={() => setIsModalOpen(false)}
      basic
      dimmer="inverted"
      size="small"
    >
      <Modal.Header>{header}</Modal.Header>
      <Modal.Content>
        <Form loading={isSaving}>{children}</Form>
      </Modal.Content>
      <Modal.Actions>
        <Button icon="cancel" content="Cancel" onClick={() => setIsModalOpen(false)} />
        <Button
          icon="save"
          content={isSaving ? "Saving..." : "Save"}
          positive
          disabled={canSave}
          onClick={async (): Promise<void> => {
            setIsSaving(true);

            await onSave();

            setIsSaving(false);
            setIsModalOpen(false);
          }}
        />
      </Modal.Actions>
      {error && <Message error header="Server response" content={error} />}
    </Modal>
  );
};

export default EditFormModal;
