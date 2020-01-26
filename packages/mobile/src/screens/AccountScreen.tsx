import * as GraphQL from "../../generated/graphqlClient";

import { Button, Divider, List } from "react-native-paper";
import { Picker, ScrollView, StyleSheet, View } from "react-native";
import React, { useState } from "react";

import BaseView from "../components/BaseView";
import { ConfigStageName } from "../config";
import { NavigationStackScreenComponent } from "react-navigation-stack";
import ScreenRoutes from "./ScreenRoutes";
import StoreChecks from "../components/StoreChecks";
import { UserPreferencesSchema } from "@grumpycorp/warm-and-fuzzy-shared";
import { observer } from "mobx-react";
import { useRootStore } from "@grumpycorp/warm-and-fuzzy-shared-client";

const styles = StyleSheet.create({
  // Temperature units picker
  temperatureUnitsPicker: {
    height: 18,
    width: 140,
  },
});

const AccountScreen: NavigationStackScreenComponent<{}> = ({ navigation }): React.ReactElement => {
  const rootStore = useRootStore();

  const authStore = rootStore.authStore;
  const userPreferencesStore = rootStore.userPreferencesStore;

  const userPreferences = userPreferencesStore.userPreferences;

  const [mutableUserPreferences, setMutableUserPreferences] = useState(userPreferences);

  const isUserPreferencesDirty = !UserPreferencesSchema.UserPreferencesIsEqual(
    userPreferences,
    mutableUserPreferences
  );

  return (
    <StoreChecks requiredStores={[userPreferencesStore]}>
      <BaseView>
        <ScrollView>
          <List.Section title="Your account">
            <List.Item
              left={(): React.ReactNode => <List.Icon icon="account" />}
              title={authStore.userName}
            />
            <List.Item
              left={(): React.ReactNode => <List.Icon icon="at" />}
              title={authStore.userEmail}
            />
            <Button
              mode="outlined"
              onPress={async (): Promise<void> => {
                await authStore.authProvider.requestLogout();

                navigation.navigate(ScreenRoutes.Auth);
              }}
            >
              Sign out
            </Button>
          </List.Section>
          <List.Section title="Your preferences">
            {/* Temperature units */}
            <List.Item
              left={(): React.ReactNode => <List.Icon icon="thermometer" />}
              title={
                <View style={styles.temperatureUnitsPicker}>
                  <Picker
                    mode="dropdown"
                    onValueChange={
                      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
                      (value: any): void =>
                        setMutableUserPreferences({
                          ...mutableUserPreferences,
                          temperatureUnits: value,
                        })
                    }
                    selectedValue={mutableUserPreferences.temperatureUnits}
                    style={styles.temperatureUnitsPicker /* yup, we have to repeat them. */}
                  >
                    {[GraphQL.TemperatureUnits.Celsius, GraphQL.TemperatureUnits.Fahrenheit].map(
                      (temperatureUnit): React.ReactElement => (
                        <Picker.Item
                          key={temperatureUnit}
                          label={temperatureUnit}
                          value={temperatureUnit}
                        />
                      )
                    )}
                  </Picker>
                </View>
              }
            />
            {/* Save button */}
            <Button
              disabled={!isUserPreferencesDirty}
              mode="outlined"
              onPress={async (): Promise<void> => {
                await userPreferencesStore.updateUserPreferences(mutableUserPreferences);
              }}
            >
              Save
            </Button>
          </List.Section>
          <List.Section title="Your permissions">
            {authStore.userPermissions.map(permission => (
              <List.Item
                key={permission}
                left={(): React.ReactNode => <List.Icon icon="check" />}
                title={permission}
              />
            ))}
          </List.Section>
          <Divider />
          <List.Section title="Tenant">
            <List.Item
              left={(): React.ReactNode => <List.Icon icon="home" />}
              title={authStore.tenant}
            />
          </List.Section>
          <Divider />
          <List.Section title="API">
            <List.Item
              left={(): React.ReactNode => <List.Icon icon="server" />}
              title={ConfigStageName}
            />
          </List.Section>
        </ScrollView>
      </BaseView>
    </StoreChecks>
  );
};

AccountScreen.navigationOptions = {
  title: "Account",
};

export default observer(AccountScreen);
