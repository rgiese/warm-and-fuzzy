import { Theme } from "react-native-paper";

// Used to pass the theme to navigationOptions/defaultNavigationOptions where it isn't available from withTheme(),
// e.g. inside a static navigationOptions lambda.
export default interface ScreenProps {
  theme: Theme;
}
