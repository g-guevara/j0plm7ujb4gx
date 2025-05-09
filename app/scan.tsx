import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { cardData, transactionData } from "./data/sampleData";

// Definir el tipo para una transacción parcial (con campos opcionales)
type PartialTransaction = {
  date?: string;
  category?: string;
  name?: string;
  mount?: number;
  cardId?: number;
};

export default function ScanScreen() {
  const router = useRouter();
  const { cardId } = useLocalSearchParams<{ cardId: string }>();
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<PartialTransaction | null>(null);

  // Find the selected card
  const selectedCard = cardData.find(card => card.id === parseInt(cardId as string));

  // Función para seleccionar una imagen de la galería
  const pickImage = async () => {
    // Solicitar permiso para acceder a la galería
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permiso denegado", "Necesitamos permiso para acceder a tus fotos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setScannedData(null); // Limpiar datos previos
    }
  };

  // Función para extraer datos de la imagen usando un enfoque simplificado
  const scanReceipt = async () => {
    if (!image) {
      Alert.alert("Error", "Por favor selecciona una imagen primero");
      return;
    }

    setScanning(true);

    try {
      // Como alternativa a la API de OpenAI, usaremos un enfoque simplificado para demostración
      // En una aplicación real, integrarías con la API de OpenAI o usarías otra solución de OCR

      console.log("Procesando imagen:", image);
      
      // Simular un tiempo de procesamiento para la demostración
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Crear datos de ejemplo basados en la "detección"
      // En una app real, estos datos vendrían del análisis de la imagen
      const fechaActual = new Date().toISOString().split('T')[0];
      
      // Datos de transacción simulados - en una app real estos vendrían de la API
      const extractedData = {
        date: fechaActual,
        category: "Compras",
        name: "Factura escaneada",
        mount: Math.floor(Math.random() * 10000) / 100,  // Un valor aleatorio para demostración
        cardId: parseInt(cardId as string) // Add the cardId from the route params
      };
      
      console.log("Datos extraídos:", extractedData);
      setScannedData(extractedData);
      
    } catch (error) {
      console.error("Error al escanear:", error);
      Alert.alert(
        "Error al procesar la imagen", 
        "No se pudieron extraer datos de la imagen. Detalles: " + String(error)
      );
    } finally {
      setScanning(false);
    }
  };

  // Función para guardar la transacción en sampleData
  const saveTransaction = async () => {
    if (!scannedData) {
      Alert.alert("Error", "No hay datos para guardar");
      return;
    }

    // Importar la función para guardar transacciones
    const { saveTransaction } = await import('./services/storage');

    // Crear un nuevo ID para la transacción
    const newId = Math.max(...transactionData.map(t => t.id)) + 1;

    // Crear la nueva transacción
    const newTransaction = {
      id: newId,
      date: scannedData.date || new Date().toISOString().split('T')[0],
      category: scannedData.category || "Otros",
      name: scannedData.name || "Transacción sin nombre",
      mount: scannedData.mount || 0,
      cardId: scannedData.cardId // Include the cardId
    };

    try {
      // Guardar usando AsyncStorage
      const success = await saveTransaction(newTransaction);
      
      if (success) {
        Alert.alert(
          "Transacción Guardada",
          `ID: ${newTransaction.id}\nFecha: ${newTransaction.date}\nCategoría: ${newTransaction.category}\nNombre: ${newTransaction.name}\nMonto: ${newTransaction.mount.toFixed(2)}\nTarjeta: ${selectedCard?.name || 'Sin tarjeta'}`,
          [
            {
              text: "OK",
              onPress: () => {
                // Redirigir a la pantalla de inicio
                router.push("/");
              }
            }
          ]
        );
      } else {
        Alert.alert("Error", "No se pudo guardar la transacción");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      Alert.alert("Error", "Ocurrió un problema al guardar la transacción");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Escanear Transacción</Text>
        <Text style={styles.subtitle}>
          Selecciona una foto de un recibo o factura para extraer la información
        </Text>
        {selectedCard && (
          <View style={[styles.cardIndicator, { backgroundColor: selectedCard.color }]}>
            <Text style={styles.cardName}>{selectedCard.name}</Text>
          </View>
        )}
      </View>

      <View style={styles.imageContainer}>
        <TouchableOpacity 
          style={styles.imagePicker} 
          onPress={pickImage}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <Text style={styles.imagePickerText}>Toca para seleccionar una imagen</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={scanning ? "Escaneando..." : "Escanear Recibo"}
          onPress={scanReceipt}
          disabled={!image || scanning}
        />
      </View>

      {scannedData && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Datos Extraídos:</Text>
          
          <View style={styles.dataCard}>
            {scannedData.date && (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Fecha:</Text>
                <Text style={styles.dataValue}>{scannedData.date}</Text>
              </View>
            )}
            
            {scannedData.category && (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Categoría:</Text>
                <Text style={styles.dataValue}>{scannedData.category}</Text>
              </View>
            )}
            
            {scannedData.name && (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Nombre:</Text>
                <Text style={styles.dataValue}>{scannedData.name}</Text>
              </View>
            )}
            
            {scannedData.mount !== undefined && (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Monto:</Text>
                <Text style={styles.dataValue}>${scannedData.mount.toFixed(2)}</Text>
              </View>
            )}

            {selectedCard && (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Tarjeta:</Text>
                <View style={[styles.cardValue, { backgroundColor: selectedCard.color + '20' }]}>
                  <View style={[styles.cardDot, { backgroundColor: selectedCard.color }]} />
                  <Text style={[styles.cardValueText, { color: selectedCard.color }]}>
                    {selectedCard.name}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Guardar Transacción"
              onPress={saveTransaction}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  cardIndicator: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  cardName: {
    color: 'white',
    fontWeight: '600',
  },
  imageContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  imagePicker: {
    width: "100%",
    height: 250,
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#ccc",
    borderStyle: "dashed",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePickerText: {
    color: "#666",
    fontSize: 16,
  },
  buttonContainer: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  resultContainer: {
    margin: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  dataCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dataLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  dataValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  cardValue: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  cardValueText: {
    fontWeight: '600',
    fontSize: 14,
  },
});