import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, FlatList, Image, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { cardData } from "../data/sampleData";
import { styles } from "../styles/4o-scanStyles";
import { PartialTransaction } from "../utils/imageUtils";
import { handleApiKeySave, handlePickImages, scanAllTransactions } from "../utils/scanHandlers";
import { formatAmount, getAmountStyle, saveTransactions, toggleSelectAll, toggleTransaction } from "../utils/transactionHandlers";

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

  // Renderizar cada imagen en la lista horizontal
  const renderImageItem = ({ item, index }: { item: string, index: number }) => (
    <View style={styles.imageItemContainer}>
      <View style={styles.imageItem}>
        <Image source={{ uri: item }} style={styles.thumbnailImage} resizeMode="cover" />
      </View>
      <TouchableOpacity 
        style={styles.removeImageButton}
        onPress={() => removeImage(index)}
      >
        <Ionicons name="close-circle" size={22} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Escanear Transacciones (Debug)</Text>
        <Text style={styles.subtitle}>
          Escaneo por lotes - Múltiples imágenes
        </Text>
        {selectedCard && (
          <View style={[styles.cardIndicator, { backgroundColor: selectedCard.color }]}>
            <Text style={styles.cardName}>{selectedCard.name}</Text>
          </View>
        )}
      </View>

      {/* Botón para configurar API Key */}
      <TouchableOpacity 
        style={styles.apiKeyButton} 
        onPress={() => setShowApiKeyInput(true)}
      >
        <Text style={styles.apiKeyButtonText}>
          {apiKey ? "Cambiar API Key de OpenAI" : "Configurar API Key de OpenAI"}
        </Text>
      </TouchableOpacity>

      {/* Modal para ingresar API Key */}
      {showApiKeyInput && (
        <View style={styles.apiKeyContainer}>
          <Text style={styles.apiKeyTitle}>API Key de OpenAI</Text>
          <Text style={styles.apiKeyDescription}>
            Ingresa tu API Key de OpenAI para analizar imágenes.
            La API key se guardará de forma segura en tu dispositivo.
          </Text>
          <TextInput
            style={styles.apiKeyInput}
            placeholder="sk-..."
            value={apiKey}
            onChangeText={setApiKey}
            secureTextEntry={true}
            autoCapitalize="none"
          />
          <View style={styles.apiKeyButtons}>
            <Button
              title="Cancelar"
              onPress={() => setShowApiKeyInput(false)}
              color="#999"
            />
            <Button
              title="Guardar"
              onPress={() => handleApiKeySave(apiKey, addLog, setShowApiKeyInput, () => {
                // No hacer nada después de guardar, solo cerrar el diálogo
              })}
            />
          </View>
        </View>
      )}

      {/* Contenedor de imágenes y selección */}
      <View style={styles.imageSection}>
        <View style={styles.imageContainer}>
          <TouchableOpacity 
            style={styles.imagePicker} 
            onPress={() => handlePickImages(addLog, setImages, setScannedTransactions, images.length)}
            disabled={scanning}
          >
            {images.length > 0 ? (
              <View style={styles.imageCountContainer}>
                <Ionicons name="images" size={40} color="#3498db" />
                <Text style={styles.imageCountText}>
                  {images.length} {images.length === 1 ? "imagen seleccionada" : "imágenes seleccionadas"}
                </Text>
                <Text style={styles.imageTapText}>
                  Toca para añadir más imágenes
                </Text>
              </View>
            ) : (
              <Text style={styles.imagePickerText}>
                Toca para seleccionar imágenes (máx. 7)
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Lista horizontal de thumbnails */}
        {images.length > 0 && (
          <View style={styles.thumbnailContainer}>
            <Text style={styles.thumbnailTitle}>
              Imágenes seleccionadas ({images.length}/7)
            </Text>
            <FlatList
              data={images}
              renderItem={renderImageItem}
              keyExtractor={(_, index) => `img-${index}`}
              horizontal
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={styles.thumbnailList}
            />
            {images.length < 7 && !scanning && (
              <TouchableOpacity 
                style={styles.addImageButton}
                onPress={() => handlePickImages(addLog, setImages, setScannedTransactions, images.length)}
              >
                <Ionicons name="add-circle" size={24} color="#3498db" />
                <Text style={styles.addImageText}>Añadir imagen</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Botón de escaneo y barra de progreso */}
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
            parseInt(cardId as string) // Pass the cardId to associate with scanned transactions
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

      {/* Sección de logs de depuración */}
      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Logs de depuración ({logs.length})</Text>
        <Button 
          title="Limpiar logs" 
          onPress={() => setLogs([])} 
          color="#666"
        />
        <ScrollView style={styles.logsScrollView}>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logLine}>
              {log}
            </Text>
          ))}
        </ScrollView>
      </View>

      {/* Resultados de las transacciones escaneadas */}
      {scannedTransactions.length > 0 && (
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>Transacciones Extraídas ({scannedTransactions.length}):</Text>
            
            <View style={styles.selectAllContainer}>
              <Text style={styles.selectAllText}>Seleccionar Todo</Text>
              <Switch
                value={scannedTransactions.every(t => t.selected)}
                onValueChange={(value) => toggleSelectAll(value, scannedTransactions, setScannedTransactions, addLog)}
              />
            </View>
          </View>
          
          {scannedTransactions.map((transaction, index) => (
            <TouchableOpacity 
              key={index}
              style={[
                styles.transactionCard,
                transaction.selected ? styles.selectedCard : {}
              ]}
              onPress={() => toggleTransaction(index, scannedTransactions, setScannedTransactions, addLog)}
            >
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionName}>{transaction.name}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
                {transaction.category && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{transaction.category}</Text>
                  </View>
                )}
                {selectedCard && (
                  <Text style={styles.cardNameText}>
                    <Ionicons name="card-outline" size={12} color="#666" /> {selectedCard.name}
                  </Text>
                )}
              </View>
              <View style={styles.transactionAmount}>
                <Text style={getAmountStyle(transaction.mount, styles)}>
                  {formatAmount(transaction.mount)}
                </Text>
                <View style={styles.checkboxContainer}>
                  <View style={[
                    styles.checkbox,
                    transaction.selected ? styles.checkboxSelected : {}
                  ]}>
                    {transaction.selected && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.buttonContainer}>
            <Button
              title="Guardar Transacciones"
              onPress={() => saveTransactions(scannedTransactions, addLog, router, parseInt(cardId as string))}
              disabled={!scannedTransactions.some(t => t.selected)}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// Import for useEffect to work
import { DEFAULT_API_KEY, getApiKey, saveApiKey } from "../utils/secureStorage";
