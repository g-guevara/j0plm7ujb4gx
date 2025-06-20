import { createNativeBottomTabNavigator } from '@bottom-tabs/react-navigation';

import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import { TabParamList } from '../types/navigation';

const Tab = createNativeBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
      }}
      // Tab bar styling options go directly on the Navigator
      labeled={true}
      tabBarActiveTintColor="#000000"
      tabBarStyle={{
        backgroundColor: '#FFFFFF',
      }}
      hapticFeedbackEnabled={true}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          tabBarIcon: () => ({ sfSymbol: 'house' }),
          title: "Dashboard"
        }}
      />
      <Tab.Screen 
        name="Wallet" 
        component={TransactionsScreen}
        options={{
          tabBarIcon: () => ({ sfSymbol: 'creditcard' }),
          title: "Wallet"
        }}
      />
    </Tab.Navigator>
  );
}