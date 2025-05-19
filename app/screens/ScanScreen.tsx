import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, ScrollView, View } from "react-native";
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
  const [images, setImages] = useState<string[]>([]); // Array de URIs de imágenes
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState<number>(0); // Progreso del escaneo
  const [scannedTransactions, setScannedTransactions] = useState<PartialTransaction[]>([]);
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Find the selected card
  const selectedCard = cardData.find(card => card.id === parseInt(cardId as string));

  // Función para añadir logs
  const addLog = (message: string) => {
    console.log(message); // Log a la consola nativa
    setLogs(prevLogs => [...prevLogs, `${new Date().toISOString().substring(11, 19)} - ${message}`]);
  };

  // Cargar API key al iniciar
  useEffect(() => {
    const loadApiKey = async () => {
      addLog("Buscando API key guardada...");
      // Intentar cargar desde almacenamiento seguro
      const savedApiKey = await getApiKey();
      
      if (savedApiKey) {
        addLog("API key encontrada en almacenamiento seguro");
        setApiKey(savedApiKey);
      } else {
        addLog("No se encontró API key guardada, usando valor por defecto");
        // Usar la API key por defecto (para desarrollo)
        setApiKey(DEFAULT_API_KEY);
        // Guardar la API key por defecto en el almacenamiento seguro
        await saveApiKey(DEFAULT_API_KEY);
      }
    };

    // Inicializar logs y cargar API key
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
    <ScrollView style={styles.container}>
      {/* Header */}
      <ScanScreenComponents.Header 
        title="Escanear Transacciones" 
        subtitle="Escaneo por lotes - Múltiples imágenes"
        selectedCard={selectedCard}
      />

      {/* API Key Input Modal */}
      {showApiKeyInput && (
        <ScanScreenComponents.ApiKeyModal
          apiKey={apiKey}
          setApiKey={setApiKey}
          onCancel={() => setShowApiKeyInput(false)}
          onSave={() => handleApiKeySave(apiKey, addLog, setShowApiKeyInput, () => {})}
        />
      )}

      {/* Image Picker Section */}
      <ScanScreenComponents.ImageSection
        images={images}
        scanning={scanning}
        removeImage={removeImage}
        onAddImages={() => handlePickImages(addLog, setImages, setScannedTransactions, images.length)}
      />

      {/* Scan Button and Progress Bar */}
      <View style={styles.buttonContainer}>
        <Button
          title={scanning ? `Escaneando (${Math.round(progress)}%)` : "Escanear todas las imágenes"}
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
          color="#3498db"
        />
        
        {scanning && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
        )}
      </View>

      {/* Scanned Transactions Results */}
      {scannedTransactions.length > 0 && (
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
      )}
    </ScrollView>
  );
}