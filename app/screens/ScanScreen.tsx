import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { cardData } from "../data/sampleData";
import { styles } from "../styles/4o-scanStyles";
import { PartialTransaction } from "../utils/imageUtils";
import { handleApiKeySave, handlePickImages, scanAllTransactions } from "../utils/scanHandlers";
import { formatAmount, getAmountStyle, saveTransactions, toggleSelectAll, toggleTransaction } from "../utils/transactionHandlers";

import { ScanScreenComponents } from "../components/ScanScreenComponents";

// Import for useEffect to work
import { DEFAULT_API_KEY, getApiKey, saveApiKey } from "../utils/secureStorage";

export default function ScanScreen() {
  const router = useRouter();
  const { cardId } = useLocalSearchParams<{ cardId: string }>();
  const [images, setImages] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [scannedTransactions, setScannedTransactions] = useState<PartialTransaction[]>([]);
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Find the selected card
  const selectedCard = cardData.find(card => card.id === parseInt(cardId as string));

  // Función para añadir logs
  const addLog = (message: string) => {
    console.log(message);
    setLogs(prevLogs => [...prevLogs, `${new Date().toISOString().substring(11, 19)} - ${message}`]);
  };

  // Cargar API key al iniciar
  useEffect(() => {
    const loadApiKey = async () => {
      addLog("Buscando API key guardada...");
      const savedApiKey = await getApiKey();
      
      if (savedApiKey) {
        addLog("API key encontrada en almacenamiento seguro");
        setApiKey(savedApiKey);
      } else {
        addLog("No se encontró API key guardada, usando valor por defecto");
        setApiKey(DEFAULT_API_KEY);
        await saveApiKey(DEFAULT_API_KEY);
      }
    };

    setLogs([]);
    addLog("Componente montado, logs inicializados");
    if (selectedCard) {
      addLog(`Tarjeta seleccionada: ${selectedCard.name} (ID: ${selectedCard.id})`);
    } else {
      addLog("ADVERTENCIA: No hay tarjeta seleccionada");
    }
    loadApiKey();
  }, []);

  // Eliminar una imagen del array de imágenes
  const removeImage = (index: number) => {
    addLog(`Eliminando imagen en posición ${index}`);
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  return (
    <View style={styles.container}>
      {/* Background image */}
      <Image
        source={require('../../assets/images/dashboard-bg.png')}
        style={styles.background}
        resizeMode="cover"
      />
      
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scan Receipts</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Selected Card Info */}
          {selectedCard && (
            <View style={styles.selectedCardSection}>
              <View style={[styles.selectedCardIndicator, { backgroundColor: selectedCard.color }]}>
                <Ionicons name="card-outline" size={20} color="white" />
                <Text style={styles.selectedCardName}>{selectedCard.name}</Text>
              </View>
            </View>
          )}

          {/* API Key Input Modal */}
          {showApiKeyInput && (
            <View style={styles.apiKeySection}>
              <ScanScreenComponents.ApiKeyModal
                apiKey={apiKey}
                setApiKey={setApiKey}
                onCancel={() => setShowApiKeyInput(false)}
                onSave={() => handleApiKeySave(apiKey, addLog, setShowApiKeyInput, () => {})}
              />
            </View>
          )}

          {/* Image Selection - Direct component without wrapper */}
          <ScanScreenComponents.ImageSection
            images={images}
            scanning={scanning}
            removeImage={removeImage}
            onAddImages={() => handlePickImages(addLog, setImages, setScannedTransactions, images.length)}
          />

          {/* Scan Action Section */}
          {images.length > 0 && (
            <View style={styles.scanActionSection}>
              <TouchableOpacity
                style={[
                  styles.scanButton,
                  (images.length === 0 || scanning) && styles.scanButtonDisabled
                ]}
                onPress={() => scanAllTransactions(
                  images, 
                  apiKey, 
                  addLog, 
                  setScanning, 
                  setScannedTransactions,
                  setProgress, 
                  setShowApiKeyInput,
                  parseInt(cardId as string)
                )}
                disabled={images.length === 0 || scanning}
              >
                <Ionicons 
                  name={scanning ? "hourglass-outline" : "scan-outline"} 
                  size={20} 
                  color="white" 
                  style={styles.scanButtonIcon}
                />
                <Text style={styles.scanButtonText}>
                  {scanning ? `Scanning... ${Math.round(progress)}%` : `Scan ${images.length} Image${images.length !== 1 ? 's' : ''}`}
                </Text>
              </TouchableOpacity>
              
              {scanning && (
                <View style={styles.progressSection}>
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${progress}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
                </View>
              )}
            </View>
          )}

          {/* Scanned Transactions Results */}
          {scannedTransactions.length > 0 && (
            <View style={styles.resultsSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="receipt-outline" size={24} color="#333" />
                <Text style={styles.sectionTitle}>Extracted Transactions</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Review and select transactions to save
              </Text>
              
              <ScanScreenComponents.TransactionResults
                transactions={scannedTransactions}
                selectedCard={selectedCard}
                onToggleAll={(value) => toggleSelectAll(value, scannedTransactions, setScannedTransactions, addLog)}
                onToggleTransaction={(index) => toggleTransaction(index, scannedTransactions, setScannedTransactions, addLog)}
                onSaveTransactions={() => saveTransactions(scannedTransactions, addLog, router, parseInt(cardId as string))}
                formatAmount={formatAmount}
                getAmountStyle={getAmountStyle}
                styles={styles}
              />
            </View>
          )}

          {/* Empty State */}
          {images.length === 0 && !scanning && (
            <View style={styles.emptyStateSection}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="camera-outline" size={64} color="#ccc" />
              </View>
              <Text style={styles.emptyStateTitle}>No Images Selected</Text>
              <Text style={styles.emptyStateSubtitle}>
                Tap the + button above to start scanning your receipts
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}