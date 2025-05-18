import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            title: "Finance Tracker", 
            headerShown: false, // Hide header on the index screen since it redirects
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
          name="4o-scan" 
          options={{ 
            title: "Scan",
            presentation: "modal",
          }} 
        />
      </Stack>
    </>
  );
}