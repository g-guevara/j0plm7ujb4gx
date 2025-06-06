import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen 
          name="index"
          options={{
            title: "Finance Tracker",
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="transactions"
          options={{
            title: "Transactions",
            headerLargeTitle: true,
          }}
        />
        <Stack.Screen 
          name="details"
          options={{
            title: "Transaction Details",
            headerShown: false, // Esta línea oculta el header
          }}
        />
        <Stack.Screen 
          name="scan"
          options={{
            title: "Scan Receipt",
            presentation: "modal",
          }}
        />
        <Stack.Screen 
          name="screens/CardEditScreen"
          options={{
            title: "Edit Cards",
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="screens/ProfileScreen"
          options={{
            title: "Profile",
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="screens/CategoriesScreen"
          options={{
            title: "Categories",
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="screens/ScanScreen"
          options={{
            title: "Scan Receipts",
            headerShown: false, // Esta línea oculta el header por defecto
          }}
        />
        <Stack.Screen 
          name="4o-scan"
          options={{
            title: "Scan",
            presentation: "modal",
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});