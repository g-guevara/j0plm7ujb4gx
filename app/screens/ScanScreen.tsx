import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import CoolScanButton from "../components/CoolScanButton";
import { ScanScreenComponents } from "../components/ScanScreenComponents";
import { cardData } from "../data/sampleData";
import { styles } from "../styles/4o-scanStyles";
import { PartialTransaction } from "../utils/imageUtils";
import { handleApiKeySave, handlePickImages, scanAllTransactions } from "../utils/scanHandlers";
import { DEFAULT_API_KEY, getApiKey, saveApiKey } from "../utils/secureStorage";
import { formatAmount, getAmountStyle, saveTransactions, toggleSelectAll, toggleTransaction } from "../utils/transactionHandlers";

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
      {/* <Image
        source={require('../../assets/images/dashboard-bg.png')}
        style={styles.background}
        resizeMode="cover"
      /> */}
      
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

          {/* Scan Action Section with Cool Button */}
          {images.length > 0 && (
            <View style={styles.scanActionSection}>
              <CoolScanButton
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
                scanning={scanning}
                progress={progress}
                imageCount={images.length}
              />
              
              {/* Progress text (optional, since the button now has its own progress) */}
              {scanning && (
                <View style={styles.progressSection}>

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


        </ScrollView>
      </View>
    </View>
  );
}