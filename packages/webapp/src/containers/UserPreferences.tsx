import * as GraphQL from "../generated/graphqlClient";

import {
  Container,
  DropdownItemProps,
  DropdownProps,
  Form,
  Header,
  Segment,
} from "semantic-ui-react";
import React, { useState } from "react";

import StoreChecks from "../components/StoreChecks";
import { UserPreferencesSchema } from "@grumpycorp/warm-and-fuzzy-shared";
import { observer } from "mobx-react";
import { useRootStore } from "@grumpycorp/warm-and-fuzzy-shared-client";

const UserPreferences: React.FunctionComponent = (): React.ReactElement => {
  const rootStore = useRootStore();
  const authStore = rootStore.authStore;
  const userPreferencesStore = rootStore.userPreferencesStore;

  const userFirstName = authStore.userName?.split(" ")[0];

  const userPreferences = userPreferencesStore.userPreferences;

  const [mutableUserPreferences, setMutableUserPreferences] = useState(userPreferences);
  const [isSaving, setIsSaving] = useState(false);

  const isUserPreferencesDirty = !UserPreferencesSchema.UserPreferencesIsEqual(
    userPreferences,
    mutableUserPreferences
  );

  return (
    <StoreChecks requiredStores={[userPreferencesStore]}>
      <Container style={{ paddingTop: "2rem" }} text>
        <Header as="h4" attached="top" block>
          Let&apos;s get this right for you, {userFirstName}.
        </Header>
        <Segment attached>
          <Form loading={isSaving}>
            <Form.Group>
              <Form.Select
                fluid
                label="Preferred temperature units"
                onChange={(
                  _event: React.SyntheticEvent<HTMLElement>,
                  data: DropdownProps
                ): void => {
                  setMutableUserPreferences({
                    ...mutableUserPreferences,
                    temperatureUnits: data.value as GraphQL.TemperatureUnits,
                  });
                }}
                options={[
                  GraphQL.TemperatureUnits.Celsius,
                  GraphQL.TemperatureUnits.Fahrenheit,
                ].map(
                  (temperatureUnit): DropdownItemProps => {
                    return { key: temperatureUnit, value: temperatureUnit, text: temperatureUnit };
                  }
                )}
                value={mutableUserPreferences.temperatureUnits}
              />
            </Form.Group>
            <Form.Button
              content={isSaving ? "Saving..." : "Save"}
              disabled={!isUserPreferencesDirty}
              icon="save"
              onClick={async (): Promise<void> => {
                setIsSaving(true);
                await userPreferencesStore.updateUserPreferences(mutableUserPreferences);
                setIsSaving(false);
              }}
              positive
            />
          </Form>
        </Segment>
      </Container>
    </StoreChecks>
  );
};

export default observer(UserPreferences);
