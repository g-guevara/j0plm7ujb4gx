import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function IndexScreen() {
  // This screen simply redirects to the transactions screen
  // You could add some initialization logic here if needed
  
  // Example: You might want to check if the user is logged in
  // or load some initial data before redirecting
  
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3498db" />
      <Text style={styles.loadingText}>Loading FinanceTracker...</Text>
      <Redirect href="/transactions" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: "#333",
  },
});