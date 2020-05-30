import * as GraphQL from "../../generated/graphqlClient";
import * as ThemedText from "../components/ThemedText";

import { Button, Switch, Text, Theme } from "react-native-paper";
import { ColorCodes, IconNames } from "../Theme";
import { Picker, ScrollView, StyleSheet, View } from "react-native";
import React, { useContext, useState } from "react";
import {
  Temperature,
  ThermostatSettingsHelpers,
  useRootStore,
} from "@grumpycorp/warm-and-fuzzy-shared-client";

import BaseView from "../components/BaseView";
import DateTimePicker from "@react-native-community/datetimepicker";
import { NavigationParams } from "react-navigation";
import { NavigationStackScreenComponent } from "react-navigation-stack";
import ScreenBaseStyles from "./ScreenBaseStyles";
import Slider from "@react-native-community/slider";
import { ThemeContext } from "react-native-elements";
import { ThermostatSettingSchema } from "@grumpycorp/warm-and-fuzzy-shared";
import fastCompare from "react-fast-compare";
import moment from "moment";
import { observer } from "mobx-react";

const styles = StyleSheet.create({
  // Hold row
  holdPicker: {
    marginLeft: -6,
  },
  // Schedule row
  scheduleRow: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    paddingTop: 8,
    paddingBottom: 8,
    alignContent: "space-around",
  },
  scheduleDayButton: {
    marginRight: 10,
    marginTop: 8,
  },
  // One row per set point
  setPointRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 8,
  },
  // Left column: text
  setPointText: {
    flex: 2,
    fontSize: 16,
  },
  // Center column: slider
  setPointSlider: {
    flex: 3,
    height: 12,
    width: 100,
  },
  // Right column: switch
  setPointSwitch: {
    flex: 1,
  },
  // Final row
  saveButtonRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
  },
});

export interface ThermostatSettingNavigationParams extends NavigationParams {
  mutableSettingsStore: ThermostatSettingsHelpers.MutableSettingsStore;
  thermostatSetting: ThermostatSettingsHelpers.IndexedThermostatSetting;
  availableActions: GraphQL.ThermostatAction[];
  isNewSetting?: boolean;
}

/* ESLint wants to see this as a proper function component. */
/* This NavigationStack stuff is too weird to mess with it. Alas. */
/* eslint-disable react/function-component-definition */

const ThermostatSettingScreen: NavigationStackScreenComponent<ThermostatSettingNavigationParams> = ({
  navigation,
}): React.ReactElement => {
  const theme = useContext(ThemeContext).theme;

  const thermostatSetting =
    navigation.state.params?.thermostatSetting ??
    ({} as ThermostatSettingsHelpers.IndexedThermostatSetting);

  const [mutableSetting, updateMutableSetting] = useState(thermostatSetting);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const [isShowingTimePicker, setShowingTimePicker] = useState(false);

  if (!navigation.state.params) {
    return <Text>Error: parameters missing.</Text>;
  }

  const mutableSettingsStore = navigation.state.params.mutableSettingsStore;
  const availableActions = navigation.state.params.availableActions;
  const isNewSetting = !!navigation.state.params.isNewSetting;

  const isDirty = isNewSetting || !fastCompare(mutableSetting, thermostatSetting);

  const rootStore = useRootStore();
  const userPreferences = rootStore.userPreferencesStore.userPreferences;

  //
  // Functions to change in-flight (editing) state
  //

  const onChangeAllowedAction = (action: GraphQL.ThermostatAction, allowed: boolean): void => {
    const actions = mutableSetting.allowedActions.filter(a => a !== action);

    if (allowed) {
      actions.push(action);
    }

    updateMutableSetting({ ...mutableSetting, allowedActions: actions });
  };

  const onScheduledTimeChange = (_e: Event, time?: Date): void => {
    const atMinutesSinceMidnight = time ? time.getHours() * 60 + time.getMinutes() : 0;

    setShowingTimePicker(false);
    updateMutableSetting({ ...mutableSetting, atMinutesSinceMidnight });
  };

  //
  // Helpers
  //

  // eslint-disable-next-line react/no-multi-comp
  function generateDayOfWeekButton(dayOfWeek: GraphQL.DayOfWeek): React.ReactElement {
    return (
      <Button
        key={dayOfWeek}
        mode={mutableSetting.daysOfWeek?.includes(dayOfWeek) ? "contained" : "outlined"}
        onPress={(): void => {
          const daysOfWeek = mutableSetting.daysOfWeek?.includes(dayOfWeek)
            ? mutableSetting.daysOfWeek?.filter(allowedDay => allowedDay !== dayOfWeek)
            : mutableSetting.daysOfWeek?.concat(dayOfWeek);

          updateMutableSetting({ ...mutableSetting, daysOfWeek });
        }}
        style={styles.scheduleDayButton}
        uppercase={false}
      >
        {dayOfWeek.substring(0, 3)}
      </Button>
    );
  }

  const capitalizeString = (str: string): string => {
    return str.charAt(0).toLocaleUpperCase() + str.substring(1);
  };

  return (
    <BaseView>
      <ScrollView style={ScreenBaseStyles.topLevelView}>
        {// Hold settings
        mutableSetting.type === GraphQL.ThermostatSettingType.Hold && (
          <View>
            <Picker
              mode="dropdown"
              // onValueChange is typed as `any` -> tell eslint to go away
              // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
              onValueChange={(value: any): void =>
                updateMutableSetting({ ...mutableSetting, holdUntil: new Date(value as number) })
              }
              selectedValue={mutableSetting.holdUntil?.valueOf()}
              style={styles.holdPicker}
            >
              <Picker.Item
                label={capitalizeString(
                  ThermostatSettingsHelpers.FormatHoldUntil(mutableSetting.holdUntil ?? new Date())
                )}
                value={mutableSetting.holdUntil?.valueOf()}
              />
              <Picker.Item
                label="Forever"
                value={ThermostatSettingsHelpers.HoldUntilForeverSentinel.valueOf()}
              />
              {ThermostatSettingsHelpers.HoldUntilHoursFromNowOptions.map(
                (hour): React.ReactElement => {
                  return (
                    <Picker.Item
                      key={hour}
                      label={`Until ${hour} hours from now`}
                      value={moment()
                        .add(hour, "hours")
                        .toDate()
                        .valueOf()}
                    />
                  );
                }
              )}
            </Picker>
          </View>
        )}
        {// Scheduled settings
        mutableSetting.type === GraphQL.ThermostatSettingType.Scheduled && (
          <>
            <View style={styles.scheduleRow}>
              <Button
                icon={IconNames[mutableSetting.type]}
                mode="contained"
                onPress={(): void => setShowingTimePicker(true)}
                style={styles.scheduleDayButton}
                uppercase={false}
              >
                At{" "}
                {ThermostatSettingsHelpers.FormatMinutesSinceMidnight(
                  mutableSetting.atMinutesSinceMidnight ?? 0
                )}
              </Button>
              {isShowingTimePicker && (
                <DateTimePicker
                  display="default"
                  is24Hour
                  minuteInterval={5}
                  mode="time"
                  onChange={onScheduledTimeChange}
                  value={
                    new Date(
                      2000,
                      1,
                      1,
                      Math.floor((mutableSetting.atMinutesSinceMidnight ?? 0) / 60),
                      Math.round((mutableSetting.atMinutesSinceMidnight ?? 0) % 60)
                    )
                  }
                />
              )}
            </View>
            <View style={styles.scheduleRow}>
              {ThermostatSettingsHelpers.WeekdayDays.map(dayOfWeek =>
                generateDayOfWeekButton(dayOfWeek)
              )}
            </View>
            <View style={styles.scheduleRow}>
              {ThermostatSettingsHelpers.WeekendDays.map(dayOfWeek =>
                generateDayOfWeekButton(dayOfWeek)
              )}
            </View>
          </>
        )}
        {/* Set point: Heat */}
        {availableActions.includes(GraphQL.ThermostatAction.Heat) && (
          <View style={styles.setPointRow}>
            <Text style={styles.setPointText}>
              <ThemedText.Heat>Heat</ThemedText.Heat> to{" "}
              {Temperature.toString(mutableSetting.setPointHeat, userPreferences)}
            </Text>
            <Slider
              maximumTrackTintColor={ColorCodes[GraphQL.ThermostatAction.Heat]}
              maximumValue={ThermostatSettingSchema.SetPointRange.max}
              minimumTrackTintColor={ColorCodes[GraphQL.ThermostatAction.Heat]}
              minimumValue={ThermostatSettingSchema.SetPointRange.min}
              onValueChange={(value: number): void =>
                updateMutableSetting({ ...mutableSetting, setPointHeat: value })
              }
              step={1}
              style={styles.setPointSlider}
              thumbTintColor={ColorCodes[GraphQL.ThermostatAction.Heat]}
              value={mutableSetting.setPointHeat}
            />
            <Switch
              color={ColorCodes[GraphQL.ThermostatAction.Heat]}
              onValueChange={(value: boolean): void =>
                onChangeAllowedAction(GraphQL.ThermostatAction.Heat, value)
              }
              style={styles.setPointSwitch}
              value={mutableSetting.allowedActions.includes(GraphQL.ThermostatAction.Heat)}
            />
          </View>
        )}

        {/* Set point: Cool */}
        {availableActions.includes(GraphQL.ThermostatAction.Cool) && (
          <View style={styles.setPointRow}>
            <Text style={styles.setPointText}>
              <ThemedText.Cool>Cool</ThemedText.Cool> to{" "}
              {Temperature.toString(mutableSetting.setPointCool, userPreferences)}
            </Text>
            <Slider
              maximumTrackTintColor={ColorCodes[GraphQL.ThermostatAction.Cool]}
              maximumValue={ThermostatSettingSchema.SetPointRange.max}
              minimumTrackTintColor={ColorCodes[GraphQL.ThermostatAction.Cool]}
              minimumValue={ThermostatSettingSchema.SetPointRange.min}
              onValueChange={(value: number): void =>
                updateMutableSetting({ ...mutableSetting, setPointCool: value })
              }
              step={1}
              style={styles.setPointSlider}
              thumbTintColor={ColorCodes[GraphQL.ThermostatAction.Cool]}
              value={mutableSetting.setPointCool}
            />
            <Switch
              color={ColorCodes[GraphQL.ThermostatAction.Cool]}
              onValueChange={(value: boolean): void =>
                onChangeAllowedAction(GraphQL.ThermostatAction.Cool, value)
              }
              style={styles.setPointSwitch}
              value={mutableSetting.allowedActions.includes(GraphQL.ThermostatAction.Cool)}
            />
          </View>
        )}

        {/* Set point: Circulate */}
        {availableActions.includes(GraphQL.ThermostatAction.Circulate) && (
          <View style={styles.setPointRow}>
            <ThemedText.Circulate style={styles.setPointText}>Circulate</ThemedText.Circulate>
            <View style={styles.setPointSlider}>{/* Empty */}</View>
            <Switch
              color={ColorCodes[GraphQL.ThermostatAction.Circulate]}
              onValueChange={(value: boolean): void =>
                onChangeAllowedAction(GraphQL.ThermostatAction.Circulate, value)
              }
              style={styles.setPointSwitch}
              value={mutableSetting.allowedActions.includes(GraphQL.ThermostatAction.Circulate)}
            />
          </View>
        )}

        <View style={styles.saveButtonRow}>
          {/* Cancel button */}
          {isNewSetting && (
            <Button
              color={ColorCodes[GraphQL.ThermostatAction.Heat]}
              mode="outlined"
              onPress={(): boolean => navigation.goBack()}
            >
              Cancel
            </Button>
          )}

          {/* Remove button */}
          {!isNewSetting && (
            <Button
              color={ColorCodes[GraphQL.ThermostatAction.Heat]}
              disabled={isDirty}
              loading={isRemoving}
              mode="outlined"
              onPress={async (): Promise<void> => {
                setIsRemoving(true);
                await mutableSettingsStore.onRemove(mutableSetting);
                navigation.goBack();
              }}
            >
              {isRemoving ? "Removing" : "Remove"}
            </Button>
          )}

          {/* Save button */}
          <Button
            color={(theme as Theme)?.colors?.text}
            disabled={!isDirty}
            loading={isSaving}
            mode="outlined"
            onPress={async (): Promise<void> => {
              setIsSaving(true);

              if (isNewSetting) {
                await mutableSettingsStore.onAdd(mutableSetting);
              } else {
                await mutableSettingsStore.onSave(mutableSetting);
              }

              navigation.goBack();
            }}
          >
            {isSaving ? "Saving" : "Save"}
          </Button>
        </View>
      </ScrollView>
    </BaseView>
  );
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
ThermostatSettingScreen.navigationOptions = ({ navigation }) => {
  const thermostatSetting = navigation.state.params?.thermostatSetting;

  return {
    title: `${thermostatSetting?.type ?? ""} setting`,
  };
};

export default observer(ThermostatSettingScreen);
