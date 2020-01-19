import React, { useContext, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ThemeContext } from "react-native-elements";
import { Button, Switch, Text, Theme } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import Slider from "@react-native-community/slider";
import { NavigationParams } from "react-navigation";
import { NavigationStackScreenComponent } from "react-navigation-stack";
import fastCompare from "react-fast-compare";
import { observer } from "mobx-react";

import { ThermostatSettingSchema } from "@grumpycorp/warm-and-fuzzy-shared";
import { ThermostatSettingsHelpers } from "@grumpycorp/warm-and-fuzzy-shared-client";

import * as GraphQL from "../../generated/graphqlClient";

import BaseView from "../components/BaseView";
import ScreenBaseStyles from "../screens/ScreenBaseStyles";

import * as ThemedText from "../components/ThemedText";
import { ColorCodes, IconNames } from "../Theme";

const styles = StyleSheet.create({
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

const ThermostatSettingScreen: NavigationStackScreenComponent<ThermostatSettingNavigationParams> = ({
  navigation,
}): React.ReactElement => {
  const theme = useContext(ThemeContext).theme;

  const thermostatSetting =
    navigation.state.params?.thermostatSetting ||
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

  const isDirty =
    navigation.state.params.isNewSetting || !fastCompare(mutableSetting, thermostatSetting);

  //
  // Functions to change in-flight (editing) state
  //

  const onChangeAllowedAction = (action: GraphQL.ThermostatAction, allowed: boolean) => {
    let actions = mutableSetting.allowedActions.filter(a => a !== action);

    if (allowed) {
      actions.push(action);
    }

    updateMutableSetting({ ...mutableSetting, allowedActions: actions });
  };

  const onScheduledTimeChange = (_e: Event, time?: Date) => {
    const atMinutesSinceMidnight = time ? time.getHours() * 60 + time.getMinutes() : 0;

    setShowingTimePicker(false);
    updateMutableSetting({ ...mutableSetting, atMinutesSinceMidnight });
  };

  //
  // Helpers
  //

  const generateDayOfWeekButton = (dayOfWeek: GraphQL.DayOfWeek): React.ReactElement => {
    return (
      <Button
        key={dayOfWeek}
        style={styles.scheduleDayButton}
        uppercase={false}
        mode={mutableSetting.daysOfWeek?.includes(dayOfWeek) ? "contained" : "outlined"}
        onPress={() => {
          const daysOfWeek = mutableSetting.daysOfWeek?.includes(dayOfWeek)
            ? mutableSetting.daysOfWeek?.filter(allowedDay => allowedDay !== dayOfWeek)
            : mutableSetting.daysOfWeek?.concat(dayOfWeek);

          updateMutableSetting({ ...mutableSetting, daysOfWeek });
        }}
      >
        {dayOfWeek.substring(0, 3)}
      </Button>
    );
  };

  return (
    <BaseView>
      <ScrollView style={ScreenBaseStyles.topLevelView}>
        {// Scheduled settings
        mutableSetting.type === GraphQL.ThermostatSettingType.Scheduled && (
          <>
            <View style={styles.scheduleRow}>
              <Button
                icon={IconNames[mutableSetting.type]}
                style={styles.scheduleDayButton}
                uppercase={false}
                mode="contained"
                onPress={() => setShowingTimePicker(true)}
              >
                At{" "}
                {ThermostatSettingsHelpers.FormatMinutesSinceMidnight(
                  mutableSetting.atMinutesSinceMidnight || 0
                )}
              </Button>
              {isShowingTimePicker && (
                <DateTimePicker
                  value={
                    new Date(
                      2000,
                      1,
                      1,
                      Math.floor((mutableSetting.atMinutesSinceMidnight || 0) / 60),
                      Math.round((mutableSetting.atMinutesSinceMidnight || 0) % 60)
                    )
                  }
                  mode="time"
                  is24Hour
                  display="default"
                  minuteInterval={5}
                  onChange={onScheduledTimeChange}
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
              <ThemedText.Heat>Heat</ThemedText.Heat> to {mutableSetting.setPointHeat} &deg;C
            </Text>
            <Slider
              style={styles.setPointSlider}
              value={mutableSetting.setPointHeat}
              onValueChange={(value): void =>
                updateMutableSetting({ ...mutableSetting, setPointHeat: value })
              }
              minimumValue={ThermostatSettingSchema.SetPointRange.min}
              maximumValue={ThermostatSettingSchema.SetPointRange.max}
              step={1}
              minimumTrackTintColor={ColorCodes[GraphQL.ThermostatAction.Heat]}
              maximumTrackTintColor={ColorCodes[GraphQL.ThermostatAction.Heat]}
              thumbTintColor={ColorCodes[GraphQL.ThermostatAction.Heat]}
            />
            <Switch
              style={styles.setPointSwitch}
              value={mutableSetting.allowedActions.includes(GraphQL.ThermostatAction.Heat)}
              onValueChange={value => onChangeAllowedAction(GraphQL.ThermostatAction.Heat, value)}
              color={ColorCodes[GraphQL.ThermostatAction.Heat]}
            />
          </View>
        )}

        {/* Set point: Cool */}
        {availableActions.includes(GraphQL.ThermostatAction.Cool) && (
          <View style={styles.setPointRow}>
            <Text style={styles.setPointText}>
              <ThemedText.Cool>Cool</ThemedText.Cool> to {mutableSetting.setPointCool} &deg;C
            </Text>
            <Slider
              style={styles.setPointSlider}
              value={mutableSetting.setPointCool}
              onValueChange={(value): void =>
                updateMutableSetting({ ...mutableSetting, setPointCool: value })
              }
              minimumValue={ThermostatSettingSchema.SetPointRange.min}
              maximumValue={ThermostatSettingSchema.SetPointRange.max}
              step={1}
              minimumTrackTintColor={ColorCodes[GraphQL.ThermostatAction.Cool]}
              maximumTrackTintColor={ColorCodes[GraphQL.ThermostatAction.Cool]}
              thumbTintColor={ColorCodes[GraphQL.ThermostatAction.Cool]}
            />
            <Switch
              style={styles.setPointSwitch}
              value={mutableSetting.allowedActions.includes(GraphQL.ThermostatAction.Cool)}
              onValueChange={value => onChangeAllowedAction(GraphQL.ThermostatAction.Cool, value)}
              color={ColorCodes[GraphQL.ThermostatAction.Cool]}
            />
          </View>
        )}

        {/* Set point: Circulate */}
        {availableActions.includes(GraphQL.ThermostatAction.Circulate) && (
          <View style={styles.setPointRow}>
            <ThemedText.Circulate style={styles.setPointText}>Circulate</ThemedText.Circulate>
            <View style={styles.setPointSlider}>{/* Empty */}</View>
            <Switch
              style={styles.setPointSwitch}
              value={mutableSetting.allowedActions.includes(GraphQL.ThermostatAction.Circulate)}
              onValueChange={value =>
                onChangeAllowedAction(GraphQL.ThermostatAction.Circulate, value)
              }
              color={ColorCodes[GraphQL.ThermostatAction.Circulate]}
            />
          </View>
        )}

        <View style={styles.saveButtonRow}>
          {/* Remove button */}
          <Button
            mode="outlined"
            disabled={isDirty}
            loading={isRemoving}
            color={ColorCodes[GraphQL.ThermostatAction.Heat]}
            onPress={async (): Promise<void> => {
              setIsRemoving(true);
              await mutableSettingsStore.onRemove(mutableSetting);
              navigation.goBack();
            }}
          >
            {isRemoving ? "Removing" : "Remove"}
          </Button>

          {/* Save button */}
          <Button
            mode="outlined"
            disabled={!isDirty}
            loading={isSaving}
            color={(theme as Theme)?.colors?.text}
            onPress={async (): Promise<void> => {
              setIsSaving(true);
              await mutableSettingsStore.onSave(mutableSetting);
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

ThermostatSettingScreen.navigationOptions = ({ navigation }) => {
  const thermostatSetting = navigation.state.params?.thermostatSetting;

  return {
    title: `${thermostatSetting?.type || ""} setting`,
  };
};

export default observer(ThermostatSettingScreen);
