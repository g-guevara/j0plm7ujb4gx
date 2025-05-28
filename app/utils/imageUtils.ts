import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

// Definir el tipo para una transacción parcial (con campos opcionales)
export type PartialTransaction = {
  id?: number;
  date?: string;
  category?: string;
  name?: string;
  mount?: number;
  cardId?: number; // Added cardId property
  selected?: boolean; // Para seleccionar/deseleccionar transacciones
};

// Función para seleccionar múltiples imágenes de la galería
export const pickImages = async (
  addLog: (message: string) => void, 
  maxSelection: number = 7
): Promise<string[] | null> => {
  addLog("Iniciando selección de múltiples imágenes...");
  addLog(`Número máximo de selección: ${maxSelection}`);
  
  // Solicitar permiso para acceder a la galería
  addLog("Solicitando permisos de galería...");
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  addLog(`Resultado de permisos: ${JSON.stringify(permissionResult)}`);
  
  if (permissionResult.granted === false) {
    addLog("ERROR: Permiso denegado para acceder a la galería");
    Alert.alert("Permiso denegado", "Necesitamos permiso para acceder a tus fotos");
    return null;
  }
  addLog("Permiso concedido para acceder a la galería");

  addLog("Abriendo selector de imágenes múltiples...");
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    quality: 1,
    allowsMultipleSelection: true, // Habilitar selección múltiple
    selectionLimit: maxSelection, // Limite de selección 
  });
  addLog(`Resultado de selección: ${result.canceled ? 'Cancelado' : 'Imágenes seleccionadas'}`);

  if (result.canceled) {
    addLog("Selección de imágenes cancelada por el usuario");
    return null;
  }

  addLog(`Seleccionadas ${result.assets.length} imágenes`);
  
  // Mapear los resultados para obtener solo las URIs
  const selectedImageUris = result.assets.map(asset => {
    addLog(`Imagen: ${asset.uri.substring(0, 30)}...`);
    addLog(`Tipo: ${asset.mimeType || 'desconocido'}`);
    addLog(`Dimensiones: ${asset.width}x${asset.height}`);
    return asset.uri;
  });
  
  return selectedImageUris;
};

// Para compatibilidad con código existente, mantenemos una versión que devuelve una sola imagen
export const pickImage = async (addLog: (message: string) => void): Promise<string | null> => {
  const results = await pickImages(addLog, 1);
  return results && results.length > 0 ? results[0] : null;
};

// Función para asignar categorías y procesar transacciones extraídas
export const processTransactions = (
  transactions: any[], 
  addLog: (message: string) => void
): PartialTransaction[] => {
  // Procesar transacciones con las categorías ya asignadas por OpenAI
  return transactions.map((transaction, index) => {
    addLog(`Procesando transacción #${index + 1}: ${transaction.name || 'Sin nombre'}`);
    
    // Asegurar todos los campos necesarios
    const t = {
      ...transaction,
      selected: true,
      date: transaction.date || new Date().toISOString().split('T')[0],
      name: transaction.name || "Transacción sin nombre",
      mount: transaction.mount !== undefined ? transaction.mount : 0,
      cardId: transaction.cardId // Preserve cardId if it exists
    };
    
    // Si OpenAI ya asignó una categoría, mantenerla; si no, usar lógica de respaldo
    if (!t.category) {
      addLog(`No se asignó categoría por OpenAI, aplicando lógica de respaldo para transacción #${index + 1}`);
      const name = t.name.toLowerCase();
      
      // Lógica de respaldo simple (estas deberían ser raras ya que OpenAI debería asignar categorías)
      if (name.includes('uber') || name.includes('trip') || name.includes('taxi') || name.includes('metro')) {
        t.category = "Transportation";
      } else if (name.includes('copec') || name.includes('gas') || name.includes('combustible')) {
        t.category = "Transportation";
      } else if (name.includes('apple') || name.includes('.com') || name.includes('netflix') || name.includes('spotify')) {
        t.category = "Life and Entertainment";
      } else if (name.includes('supermercado') || name.includes('grocery') || name.includes('food')) {
        t.category = "Food";
      } else if (name.includes('farmacia') || name.includes('doctor') || name.includes('hospital')) {
        t.category = "Health";
      } else if (name.includes('rent') || name.includes('arriendo') || name.includes('housing')) {
        t.category = "Housing";
      } else if (name.includes('traspaso a:') || name.includes('transferencia a') || name.includes('pago:')) {
        t.category = "Financial Expenses";
      } else if (name.includes('traspaso de:') || name.includes('transferencia de') || name.includes('income')) {
        t.category = "Income";
      } else if (name.includes('shopping') || name.includes('tienda') || name.includes('store')) {
        t.category = "Shopping";
      } else {
        t.category = "Others";
      }
      addLog(`Categoría de respaldo asignada: ${t.category}`);
    } else {
      addLog(`Categoría ya asignada por OpenAI: ${t.category}`);
    }
    
    return t;
  });
};