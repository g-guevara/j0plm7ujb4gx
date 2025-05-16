import { NavigatorScreenParams } from '@react-navigation/native';

// Tab Navigator Params
export type TabParamList = {
  Dashboard: undefined;
  Wallet: undefined;
};

// Stack Navigator Params
export type RootStackParamList = {
  index: undefined;
  transactions: undefined;
  details: { transactionId: string };
  scan: { cardId: string };
  '4o-scan': undefined;
  // Add the tab navigator as a screen in the root stack
  TabNavigator: NavigatorScreenParams<TabParamList>;
};

// Declare global type augmentation for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}