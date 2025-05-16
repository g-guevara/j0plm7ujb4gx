import React from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  View
} from "react-native";
import TabNavigator from "./navigation/TabNavigator";

export default function Index() {
  // En una aplicación real podrías tener un estado de carga inicial
  // Por ahora, mostraremos directamente el TabNavigator
  const isLoading = false;

  // Si estamos cargando, mostramos un indicador de actividad
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      </SafeAreaView>
    );
  }

  // Si no estamos cargando, mostramos directamente el TabNavigator
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
  keyboardView: {
    flex: 1
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center'
  }
});