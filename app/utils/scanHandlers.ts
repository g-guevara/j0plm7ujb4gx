// app/utils/scanHandlers.ts
import { Alert } from "react-native";
import { getAllCategories } from "../services/storage";
import { PartialTransaction, pickImages, processTransactions } from "./imageUtils";
import { callOpenAI, extractTransactionsFromResponse, prepareImageBase64 } from "./openiaService";
import { saveApiKey } from "./secureStorage";
import { applyTransactionMapping } from "./transactionMapping";

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
    
    // Limpiar las transacciones anteriores cuando se añaden nuevas imágenes
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
 * Procesa una sola imagen y extrae transacciones
 */
export const processImage = async (
  image: string,
  apiKey: string,
  addLog: (message: string) => void,
  cardId?: number
): Promise<PartialTransaction[]> => {
  addLog(`Procesando imagen: ${image.substring(0, 30)}...`);
  
  // Obtener categorías disponibles del almacenamiento
  addLog("Obteniendo categorías disponibles del almacenamiento...");
  const availableCategories = getAllCategories();
  addLog(`Categorías cargadas: ${availableCategories.length} categorías`);
  availableCategories.forEach(cat => {
    addLog(`- ${cat.name} (${cat.icon})`);
  });
  
  // Convertir imagen a base64
  const base64Image = await prepareImageBase64(image, addLog);
  
  // Llamar a OpenAI con las categorías disponibles
  const { responseText, status, ok } = await callOpenAI(base64Image, apiKey, addLog, availableCategories);
  
  if (!ok) {
    addLog(`ERROR: Respuesta no exitosa (status ${status})`);
    addLog(`Texto de error: ${responseText}`);
    throw new Error(`Error de OpenAI (${status}): ${responseText}`);
  }
  
  // Procesar la respuesta
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
  addLog(`Contenido de la respuesta: ${content.substring(0, 100)}...`);
  
  // Intentar extraer transacciones con validación de categorías
  const extractedTransactions = extractTransactionsFromResponse(content, addLog, availableCategories);
  
  // Verificar resultados
  if (!Array.isArray(extractedTransactions) || extractedTransactions.length === 0) {
    addLog("ERROR: No se encontraron transacciones");
    throw new Error("No se encontraron transacciones en la respuesta");
  }
  
  // Add cardId to all transactions and apply mappings
  const processedTransactions = [];
  for (const transaction of extractedTransactions) {
    let processedTransaction = { 
      ...transaction,
      cardId: cardId 
    };
    
    addLog(`Transacción extraída: ${transaction.name} - Categoría: ${transaction.category} - Monto: ${transaction.mount}`);
    
    // Apply name/category mapping if available
    if (transaction.name) {
      try {
        const mappedData = await applyTransactionMapping({
          name: transaction.name,
          category: transaction.category || "Others"
        });
        
        if (mappedData.wasModified) {
          addLog(`Aplicando mapeo para "${transaction.name}": ${mappedData.name} (${mappedData.category})`);
          processedTransaction.name = mappedData.name;
          processedTransaction.category = mappedData.category;
        }
      } catch (error) {
        // If mapping fails, just continue with original values
        addLog(`Aviso: No se pudo aplicar mapeo para "${transaction.name}"`);
      }
    }
    
    // Validar que la categoría final sea válida
    const categoryNames = availableCategories.map(cat => cat.name);
    if (!categoryNames.includes(processedTransaction.category)) {
      addLog(`Categoría final "${processedTransaction.category}" no válida, cambiando a "Others"`);
      processedTransaction.category = "Others";
    }
    
    processedTransactions.push(processedTransaction);
  }
  
  // Procesar transacciones
  return processTransactions(processedTransactions, addLog);
};

/**
 * Función para escanear todas las imágenes secuencialmente
 */
export const scanAllTransactions = async (
  images: string[],
  apiKey: string,
  addLog: (message: string) => void,
  setScanning: (scanning: boolean) => void,
  setScannedTransactions: (transactions: PartialTransaction[]) => void,
  setProgress: (progress: number) => void,
  setShowApiKeyInput: (show: boolean) => void,
  cardId?: number
) => {
  addLog("======== INICIO DE ESCANEO POR LOTES ========");
  
  if (!images || images.length === 0) {
    addLog("ERROR: No hay imágenes seleccionadas");
    Alert.alert("Error", "Por favor selecciona al menos una imagen");
    return;
  }

  addLog(`Total de imágenes a procesar: ${images.length}`);

  // Verificar si tenemos API key
  if (!apiKey) {
    addLog("ERROR: No hay API key configurada");
    setShowApiKeyInput(true);
    return;
  }
  addLog(`API Key disponible (longitud: ${apiKey.length})`);

  // Log card information
  if (cardId) {
    addLog(`Tarjeta seleccionada para transacciones: ID ${cardId}`);
  } else {
    addLog("ADVERTENCIA: No hay tarjeta seleccionada para las transacciones");
  }

  // Log available categories
  const availableCategories = getAllCategories();
  addLog(`Sistema iniciado con ${availableCategories.length} categorías disponibles`);

  setScanning(true);
  addLog("Estado scanning establecido a true");
  setProgress(0);

  const allTransactions: PartialTransaction[] = [];
  let successCount = 0;
  let errorCount = 0;

  try {
    // Procesar cada imagen secuencialmente
    for (let i = 0; i < images.length; i++) {
      setProgress((i / images.length) * 100);
      addLog(`-------- PROCESANDO IMAGEN ${i + 1}/${images.length} --------`);
      
      try {
        const imageTransactions = await processImage(images[i], apiKey, addLog, cardId);
        allTransactions.push(...imageTransactions);
        addLog(`Extraídas ${imageTransactions.length} transacciones de la imagen ${i + 1}`);
        successCount++;
      } catch (error: any) {
        addLog(`ERROR en imagen ${i + 1}: ${error.message}`);
        errorCount++;
        // Continuar con la siguiente imagen en caso de error
        continue;
      }
    }
    
    // Actualizar el estado final
    setProgress(100);
    
    // Verificar resultados finales
    if (allTransactions.length === 0) {
      throw new Error("No se pudieron extraer transacciones de ninguna imagen");
    }
    
    addLog(`Total de transacciones extraídas: ${allTransactions.length}`);
    
    // Log categorías asignadas
    const categoryCounts: { [key: string]: number } = {};
    allTransactions.forEach(t => {
      const category = t.category || "Sin categoría";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    addLog("=== RESUMEN DE CATEGORÍAS ASIGNADAS ===");
    Object.entries(categoryCounts).forEach(([category, count]) => {
      addLog(`${category}: ${count} transacciones`);
    });
    
    setScannedTransactions(allTransactions);
    
    // Mostrar resumen de escaneo
    Alert.alert(
      "Escaneo Completado",
      `Se procesaron ${successCount} de ${images.length} imágenes.\n` +
      `Total de transacciones extraídas: ${allTransactions.length}\n` +
      (errorCount > 0 ? `No se pudieron procesar ${errorCount} imágenes.` : "")
    );
    
  } catch (error: any) {
    addLog(`ERROR GENERAL: ${error.message}`);
    addLog(error.stack || "No stack trace disponible");
    Alert.alert(
      "Error al procesar imágenes", 
      `Se completaron ${successCount} de ${images.length} imágenes.\n` +
      `Error: ${error.message}`
    );
  } finally {
    setScanning(false);
    setProgress(100);
    addLog("Estado scanning establecido a false");
    addLog("======== FIN DE ESCANEO POR LOTES ========");
  }
};