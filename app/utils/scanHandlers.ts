import { Alert } from "react-native";
import { PartialTransaction, pickImages, processTransactions } from "./imageUtils";
import { callOpenAI, extractTransactionsFromResponse, prepareImageBase64 } from "./openiaService";
import { saveApiKey } from "./secureStorage";

/**
 * Gestiona la selección de múltiples imágenes
 */
export const handlePickImages = async (
  addLog: (message: string) => void,
  setImages: React.Dispatch<React.SetStateAction<string[]>>,
  setScannedTransactions: (transactions: PartialTransaction[]) => void,
  currentImagesCount: number
) => {
  // Verificar si ya tenemos el máximo de imágenes permitidas
  if (currentImagesCount >= 7) {
    addLog("ERROR: Ya se ha alcanzado el límite de 7 imágenes");
    Alert.alert("Límite alcanzado", "Solo se permiten hasta 7 imágenes");
    return;
  }

  // Calcular cuántas imágenes más se pueden seleccionar
  const remaining = 7 - currentImagesCount;
  addLog(`Se pueden seleccionar ${remaining} imágenes más`);

  const selectedImageUris = await pickImages(addLog, remaining);
  if (selectedImageUris && selectedImageUris.length > 0) {
    addLog(`Seleccionadas ${selectedImageUris.length} imágenes`);
    
    // Actualizar el estado con las nuevas imágenes
    setImages((prev: string[]) => [...prev, ...selectedImageUris]);
    addLog("Estado de imágenes actualizado");
    
    // Solo limpiar las transacciones escaneadas si estamos añadiendo la primera imagen
    if (currentImagesCount === 0) {
      setScannedTransactions([]);
      addLog("Lista de transacciones escaneadas limpiada");
    }
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
    Alert.alert("Error", "Por favor selecciona una imagen para escanear");
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