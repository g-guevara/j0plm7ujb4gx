import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Button, Image, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { transactionData } from "./data/sampleData";

// Definir el tipo para una transacción parcial (con campos opcionales)
type PartialTransaction = {
  id?: number;
  date?: string;
  category?: string;
  name?: string;
  mount?: number;
  selected?: boolean; // Para seleccionar/deseleccionar transacciones
};

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

  // Limpiar logs al montar el componente
  useEffect(() => {
    setLogs([]);
    addLog("Componente montado, logs inicializados");
  }, []);

  // Función para seleccionar una imagen de la galería
  const pickImage = async () => {
    addLog("Iniciando selección de imagen...");
    
    // Solicitar permiso para acceder a la galería
    addLog("Solicitando permisos de galería...");
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    addLog(`Resultado de permisos: ${JSON.stringify(permissionResult)}`);
    
    if (permissionResult.granted === false) {
      addLog("ERROR: Permiso denegado para acceder a la galería");
      Alert.alert("Permiso denegado", "Necesitamos permiso para acceder a tus fotos");
      return;
    }
    addLog("Permiso concedido para acceder a la galería");

    addLog("Abriendo selector de imágenes...");
    // Usar .MediaType en lugar de .MediaTypeOptions para evitar la advertencia
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: false, // Desactivamos edición para preservar toda la captura
      quality: 1,
    });
    addLog(`Resultado de selección de imagen: ${result.canceled ? 'Cancelado' : 'Imagen seleccionada'}`);

    if (result.canceled) {
      addLog("Selección de imagen cancelada por el usuario");
      return;
    }

    const selectedImage = result.assets[0];
    addLog(`Imagen seleccionada: ${selectedImage.uri}`);
    addLog(`Tipo de archivo: ${selectedImage.mimeType || 'desconocido'}`);
    addLog(`Dimensiones: ${selectedImage.width}x${selectedImage.height}`);
    
    setImage(selectedImage.uri);
    addLog("Estado de imagen actualizado con nueva URI");
    
    setScannedTransactions([]); // Limpiar datos previos
    addLog("Lista de transacciones escaneadas limpiada");
  };

  // Función para enviar una solicitud a OpenAI
// Función para enviar una solicitud a OpenAI
const callOpenAI = async (base64Image: string) => {
    addLog("-------- ENVIANDO SOLICITUD A OPENAI --------");
    addLog("URL: https://api.openai.com/v1/chat/completions");
    addLog("Método: POST");
    
    // Preparar los datos para la API de OpenAI con un prompt más simple y directo
    const prompt = "Observa esta captura de pantalla de una aplicación bancaria y extrae todas las transacciones. Para cada transacción, dame fecha, nombre y monto. Devuelve un array JSON con este formato exacto: [{\"date\":\"YYYY-MM-DD\",\"name\":\"Nombre de transacción\",\"mount\":NUMERO}]. El monto debe ser un número sin símbolos. Si es un gasto, el número es positivo. Si es un ingreso, el número es negativo. IMPORTANTE: devuelve SOLO el array JSON sin texto adicional.";
    addLog(`Prompt: ${prompt}`);
    
    // Usar el modelo gpt-4o en lugar de gpt-4-vision-preview que está descontinuado
    const payload = {
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: `data:image/png;base64,${base64Image}` } }
          ]
        }
      ],
      max_tokens: 1000
    };
    
    addLog(`Modelo utilizado: ${payload.model}`);

    try {
      addLog("Enviando solicitud a OpenAI...");
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });
      
      addLog(`Respuesta recibida. Status: ${response.status}`);
      const responseText = await response.text();
      addLog(`Respuesta (primeros 100 caracteres): ${responseText.substring(0, 100)}...`);
      
      return { responseText, status: response.status, ok: response.ok };
    } catch (error: any) {
      addLog(`ERROR en fetch: ${error.message}`);
      throw error;
    }
  };
  // Función para extraer múltiples transacciones de la imagen usando la API de OpenAI
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
      
      // Información del archivo
      try {
        const fileInfo = await FileSystem.getInfoAsync(image);
        addLog(`Información del archivo: ${JSON.stringify(fileInfo)}`);
      } catch (error: any) {
        addLog(`Error al obtener info del archivo: ${error.message}`);
      }
      
      // Leer la imagen como base64
      addLog("Leyendo imagen como base64...");
      let base64Image;
      try {
        base64Image = await FileSystem.readAsStringAsync(image, {
          encoding: FileSystem.EncodingType.Base64,
        });
        addLog(`Imagen convertida a base64. Longitud: ${base64Image.length}`);
      } catch (error: any) {
        addLog(`ERROR en conversión a base64: ${error.message}`);
        throw error;
      }
      
      // Llamar a OpenAI
      const { responseText, status, ok } = await callOpenAI(base64Image);
      
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
      let extractedTransactions = [];
      
      // Intento 1: Parsear contenido directamente como JSON
      try {
        addLog("Intento #1: Parsear contenido directamente");
        extractedTransactions = JSON.parse(content);
        addLog("Parseo directo exitoso");
      } catch (error: any) {
        addLog(`Parseo directo falló: ${error.message}`);
        
        // Intento 2: Buscar array JSON con regex
        addLog("Intento #2: Buscar array JSON con regex");
        const arrayMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
        
        if (arrayMatch) {
          addLog(`Coincidencia encontrada: ${arrayMatch[0].substring(0, 50)}...`);
          try {
            extractedTransactions = JSON.parse(arrayMatch[0]);
            addLog("Parseo de coincidencia exitoso");
          } catch (error2: any) {
            addLog(`Parseo de coincidencia falló: ${error2.message}`);
            throw error2;
          }
        } else {
          addLog("No se encontró array JSON en la respuesta");
          throw new Error("No se pudo extraer JSON de la respuesta");
        }
      }
      
      // Verificar resultados
      if (!Array.isArray(extractedTransactions) || extractedTransactions.length === 0) {
        addLog("ERROR: No se encontraron transacciones");
        throw new Error("No se encontraron transacciones en la respuesta");
      }
      
      // Procesar transacciones
      addLog(`Se encontraron ${extractedTransactions.length} transacciones`);
      addLog(`Primer elemento: ${JSON.stringify(extractedTransactions[0])}`);
      
      // Añadir selección y categorías
      const processedTransactions = extractedTransactions.map((transaction, index) => {
        addLog(`Procesando transacción #${index + 1}`);
        
        // Asegurar todos los campos necesarios
        const t = {
          ...transaction,
          selected: true,
          date: transaction.date || new Date().toISOString().split('T')[0],
          name: transaction.name || "Transacción sin nombre",
          mount: transaction.mount !== undefined ? transaction.mount : 0
        };
        
        // Añadir categoría si no existe
        if (!t.category) {
          addLog(`Asignando categoría para transacción #${index + 1}`);
          const name = t.name.toLowerCase();
          
          if (name.includes('uber') || name.includes('trip')) {
            t.category = "Transporte";
          } else if (name.includes('copec')) {
            t.category = "Combustible";
          } else if (name.includes('apple') || name.includes('.com')) {
            t.category = "Suscripciones";
          } else if (name.includes('traspaso a:') || name.includes('transferencia a')) {
            t.category = "Transferencias";
          } else if (name.includes('traspaso de:') || name.includes('transferencia de')) {
            t.category = "Ingresos";
          } else if (name.includes('pago:')) {
            t.category = "Pagos";
          } else {
            t.category = "Otros";
          }
          addLog(`Categoría asignada: ${t.category}`);
        }
        
        return t;
      });
      
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
  const handleApiKeySave = () => {
    addLog("Guardando API Key...");
    if (!apiKey || apiKey.trim().length < 20) {
      addLog("ERROR: API Key inválida");
      Alert.alert("API Key inválida", "Por favor ingresa una API key válida de OpenAI");
      return;
    }
    
    addLog(`API Key válida (longitud: ${apiKey.length})`);
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
            La API key no se guarda en el servidor y solo se usa para esta sesión.
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
          onPress={pickImage}
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
  apiKeyButton: {
    alignSelf: 'center',
    marginBottom: 16,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  apiKeyButtonText: {
    color: '#3498db',
    fontWeight: '500',
  },
  apiKeyContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  apiKeyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  apiKeyDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  apiKeyInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  apiKeyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  logsContainer: {
    margin: 16,
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 10,
  },
  logsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  logsScrollView: {
    height: 200,
    marginTop: 8,
  },
  logLine: {
    color: '#ddd',
    fontFamily: 'monospace',
    fontSize: 11,
    marginBottom: 2,
  },
  resultContainer: {
    margin: 16,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  selectAllContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectAllText: {
    marginRight: 8,
    fontSize: 14,
    color: "#666",
  },
  transactionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  selectedCard: {
    backgroundColor: "#E3F2FD",
    borderColor: "#2196F3",
    borderWidth: 1,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  categoryText: {
    color: "#2E7D32",
    fontWeight: "500",
    fontSize: 12,
  },
  transactionAmount: {
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E53935",
    marginBottom: 4,
  },
  incomeAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 4,
  },
  checkboxContainer: {
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#999",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  checkmark: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});