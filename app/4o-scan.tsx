import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Button, Image, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { transactionData } from "./data/sampleData";
import { styles } from "./styles/4o-scanStyles";
import { PartialTransaction, pickImage, processTransactions } from "./utils/imageUtils";
import { callOpenAI, extractTransactionsFromResponse, prepareImageBase64 } from "./utils/openiaService";
import { DEFAULT_API_KEY, getApiKey, saveApiKey } from "./utils/secureStorage";

export default function ScanDebugScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scannedTransactions, setScannedTransactions] = useState<PartialTransaction[]>([]);
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

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
    loadApiKey();
  }, []);

  // Función para seleccionar una imagen
  const handlePickImage = async () => {
    const selectedImageUri = await pickImage(addLog);
    if (selectedImageUri) {
      setImage(selectedImageUri);
      addLog("Estado de imagen actualizado con nueva URI");
      
      setScannedTransactions([]);
      addLog("Lista de transacciones escaneadas limpiada");
    }
  };
  
  // Función para extraer transacciones de la imagen
  const scanTransactions = async () => {
    addLog("======== INICIO DE ESCANEO ========");
    
    if (!image) {
      addLog("ERROR: No hay imagen seleccionada");
      Alert.alert("Error", "Por favor selecciona una imagen primero");
      return;
    }

    // Verificar si tenemos API key
    if (!apiKey) {
      addLog("ERROR: No hay API key configurada");
      setShowApiKeyInput(true);
      return;
    }
    addLog(`API Key disponible (longitud: ${apiKey.length})`);

    setScanning(true);
    addLog("Estado scanning establecido a true");

    try {
      addLog("-------- PREPARACIÓN DE IMAGEN --------");
      
      // Convertir imagen a base64
      const base64Image = await prepareImageBase64(image, addLog);
      
      // Llamar a OpenAI
      const { responseText, status, ok } = await callOpenAI(base64Image, apiKey, addLog);
      
      if (!ok) {
        addLog(`ERROR: Respuesta no exitosa (status ${status})`);
        addLog(`Texto de error: ${responseText}`);
        throw new Error(`Error de OpenAI (${status}): ${responseText}`);
      }
      
      // Procesar la respuesta
      addLog("-------- PROCESAMIENTO DE LA RESPUESTA --------");
      let data;
      try {
        data = JSON.parse(responseText);
        addLog("Respuesta parseada como JSON");
      } catch (error: any) {
        addLog(`ERROR al parsear respuesta como JSON: ${error.message}`);
        throw error;
      }
      
      // Verificar estructura de la respuesta
      if (!data.choices || !data.choices.length || !data.choices[0].message) {
        addLog("ERROR: Estructura de respuesta inválida");
        throw new Error("Formato de respuesta inesperado de OpenAI");
      }
      
      // Extraer el contenido y buscar JSON
      const content = data.choices[0].message.content;
      addLog(`Contenido de la respuesta: ${content}`);
      
      // Intentar extraer transacciones
      addLog("-------- EXTRACCIÓN DE TRANSACCIONES --------");
      const extractedTransactions = extractTransactionsFromResponse(content, addLog);
      
      // Verificar resultados
      if (!Array.isArray(extractedTransactions) || extractedTransactions.length === 0) {
        addLog("ERROR: No se encontraron transacciones");
        throw new Error("No se encontraron transacciones en la respuesta");
      }
      
      // Procesar transacciones
      const processedTransactions = processTransactions(extractedTransactions, addLog);
      
      addLog(`Transacciones procesadas: ${JSON.stringify(processedTransactions)}`);
      setScannedTransactions(processedTransactions);
      addLog("Estado actualizado con transacciones procesadas");
      
    } catch (error: any) {
      addLog(`ERROR GENERAL: ${error.message}`);
      addLog(error.stack || "No stack trace disponible");
      Alert.alert("Error al procesar la imagen", `No se pudieron extraer datos: ${error.message}`);
    } finally {
      setScanning(false);
      addLog("Estado scanning establecido a false");
      addLog("======== FIN DE ESCANEO ========");
    }
  };

  // Función para manejar la configuración de la API key
  const handleApiKeySave = async () => {
    addLog("Guardando API Key...");
    if (!apiKey || apiKey.trim().length < 20) {
      addLog("ERROR: API Key inválida");
      Alert.alert("API Key inválida", "Por favor ingresa una API key válida de OpenAI");
      return;
    }
    
    addLog(`API Key válida (longitud: ${apiKey.length})`);
    
    // Guardar la API key en el almacenamiento seguro
    const saved = await saveApiKey(apiKey);
    if (saved) {
      addLog("API Key guardada en almacenamiento seguro");
    } else {
      addLog("ERROR: No se pudo guardar la API Key en almacenamiento seguro");
    }
    
    setShowApiKeyInput(false);
    addLog("Modal API Key cerrado");
    scanTransactions(); // Continuar con el escaneo
  };

  // Función para seleccionar/deseleccionar todas las transacciones
  const toggleSelectAll = (select: boolean) => {
    addLog(`Seleccionando todas las transacciones: ${select}`);
    const updatedTransactions = scannedTransactions.map(transaction => ({
      ...transaction,
      selected: select
    }));
    setScannedTransactions(updatedTransactions);
    addLog("Estado actualizado con selección de todas las transacciones");
  };

  // Función para alternar la selección de una transacción individual
  const toggleTransaction = (index: number) => {
    addLog(`Alternando selección de transacción #${index}`);
    const updatedTransactions = [...scannedTransactions];
    updatedTransactions[index] = {
      ...updatedTransactions[index],
      selected: !updatedTransactions[index].selected
    };
    setScannedTransactions(updatedTransactions);
    addLog(`Transacción #${index} ahora está ${updatedTransactions[index].selected ? 'seleccionada' : 'deseleccionada'}`);
  };

  // Función para guardar las transacciones seleccionadas
  const saveTransactions = async () => {
    const selectedTransactions = scannedTransactions.filter(t => t.selected);
    addLog(`Guardando ${selectedTransactions.length} transacciones seleccionadas`);
    
    if (selectedTransactions.length === 0) {
      addLog("ERROR: No hay transacciones seleccionadas");
      Alert.alert("Error", "No hay transacciones seleccionadas para guardar");
      return;
    }

    try {
      // Para cada transacción seleccionada
      let savedCount = 0;
      
      for (const transaction of selectedTransactions) {
        // Crear un nuevo ID para la transacción
        const newId = Math.max(...transactionData.map(t => t.id)) + 1 + savedCount;
        
        // Crear la nueva transacción completa
        const newTransaction = {
          id: newId,
          date: transaction.date || new Date().toISOString().split('T')[0],
          category: transaction.category || "Otros",
          name: transaction.name || "Transacción sin nombre",
          mount: transaction.mount || 0
        };

        // En una app real, aquí guardaríamos la transacción
        // await saveTransaction(newTransaction);
        addLog(`Guardaría transacción: ${JSON.stringify(newTransaction)}`);
        
        savedCount++;
      }
      
      Alert.alert(
        "Transacciones Guardadas",
        `Se han guardado ${savedCount} transacciones correctamente.`,
        [
          {
            text: "OK",
            onPress: () => {
              addLog("Redirigiendo a pantalla inicial");
              router.push("/");
            }
          }
        ]
      );
    } catch (error: any) {
      addLog(`ERROR al guardar: ${error.message}`);
      Alert.alert("Error", "Ocurrió un problema al guardar las transacciones");
    }
  };

  // Formato para montos
  const formatAmount = (amount: number | undefined) => {
    if (amount === undefined) return "$0";
    
    // Determinar si es ingreso o gasto
    const isIncome = amount < 0;
    const absAmount = Math.abs(amount);
    
    const formattedAmount = '$' + absAmount.toLocaleString('es-CL');
    
    return isIncome 
      ? `+${formattedAmount}` 
      : `-${formattedAmount}`;
  };

  // Estilo de monto según tipo (ingreso/gasto)
  const getAmountStyle = (amount: number | undefined) => {
    if (amount === undefined) return styles.expenseAmount;
    return amount < 0 ? styles.incomeAmount : styles.expenseAmount;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Escanear Transacciones (Debug)</Text>
        <Text style={styles.subtitle}>
          Versión de depuración con logs detallados
        </Text>
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
              onPress={handleApiKeySave}
            />
          </View>
        </View>
      )}

      <View style={styles.imageContainer}>
        <TouchableOpacity 
          style={styles.imagePicker} 
          onPress={handlePickImage}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
          ) : (
            <Text style={styles.imagePickerText}>Toca para seleccionar una imagen</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={scanning ? "Escaneando..." : "Escanear con OpenAI (DEBUG)"}
          onPress={scanTransactions}
          disabled={!image || scanning}
        />
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

      {scannedTransactions.length > 0 && (
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>Transacciones Extraídas:</Text>
            
            <View style={styles.selectAllContainer}>
              <Text style={styles.selectAllText}>Seleccionar Todo</Text>
              <Switch
                value={scannedTransactions.every(t => t.selected)}
                onValueChange={(value) => toggleSelectAll(value)}
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
              onPress={() => toggleTransaction(index)}
            >
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionName}>{transaction.name}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
                {transaction.category && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{transaction.category}</Text>
                  </View>
                )}
              </View>
              <View style={styles.transactionAmount}>
                <Text style={getAmountStyle(transaction.mount)}>
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
              onPress={saveTransactions}
              disabled={!scannedTransactions.some(t => t.selected)}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}