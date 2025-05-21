import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from "react-native";
import TabNavigator from "./navigation/TabNavigator";
import { initializeStorage } from "./services/storage";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Initialize the app's data from AsyncStorage on first load
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Initializing app data from storage...");
        await initializeStorage();
        console.log("App data loaded successfully");
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading app data:", error);
        setLoadingError("Error loading data. Please restart the app.");
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Show loading indicator while initializing data
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading your data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error message if initialization failed
  if (loadingError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{loadingError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If data is loaded successfully, show the app content
  return <TabNavigator />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#555"
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center'
  },
  keyboardView: {
    flex: 1
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center'
  }
});