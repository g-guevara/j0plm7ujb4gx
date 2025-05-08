import { Alert } from "react-native";
import { PartialTransaction, pickImage, processTransactions } from "./imageUtils";
import { callOpenAI, extractTransactionsFromResponse, prepareImageBase64 } from "./openiaService";
import { saveApiKey } from "./secureStorage";

/**
 * Gestiona la selección de imágenes
 */
export const handlePickImage = async (
  addLog: (message: string) => void,
  setImage: (uri: string | null) => void,
  setScannedTransactions: (transactions: PartialTransaction[]) => void
) => {
  const selectedImageUri = await pickImage(addLog);
  if (selectedImageUri) {
    setImage(selectedImageUri);
    addLog("Estado de imagen actualizado con nueva URI");
    
    setScannedTransactions([]);
    addLog("Lista de transacciones escaneadas limpiada");
  }
};

/**
 * Gestiona el guardado de la API key
 */
export const handleApiKeySave = async (
  apiKey: string,
  addLog: (message: string) => void,
  setShowApiKeyInput: (show: boolean) => void,
  onSuccess: () => void
) => {
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
  onSuccess(); // Continuar con el escaneo
};

/**
 * Función para extraer transacciones de la imagen
 */
export const scanTransactions = async (
  image: string | null,
  apiKey: string,
  addLog: (message: string) => void,
  setScanning: (scanning: boolean) => void,
  setScannedTransactions: (transactions: PartialTransaction[]) => void,
  setShowApiKeyInput: (show: boolean) => void
) => {
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