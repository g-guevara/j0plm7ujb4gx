import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

// Definir el tipo para una transacción parcial (con campos opcionales)
export type PartialTransaction = {
  id?: number;
  date?: string;
  category?: string;
  name?: string;
  mount?: number;
  selected?: boolean; // Para seleccionar/deseleccionar transacciones
};

// Función para seleccionar una imagen de la galería
export const pickImage = async (addLog: (message: string) => void): Promise<string | null> => {
  addLog("Iniciando selección de imagen...");
  
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

  addLog("Abriendo selector de imágenes...");
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "images",
    allowsEditing: false, // Desactivamos edición para preservar toda la captura
    quality: 1,
  });
  addLog(`Resultado de selección de imagen: ${result.canceled ? 'Cancelado' : 'Imagen seleccionada'}`);

  if (result.canceled) {
    addLog("Selección de imagen cancelada por el usuario");
    return null;
  }

  const selectedImage = result.assets[0];
  addLog(`Imagen seleccionada: ${selectedImage.uri}`);
  addLog(`Tipo de archivo: ${selectedImage.mimeType || 'desconocido'}`);
  addLog(`Dimensiones: ${selectedImage.width}x${selectedImage.height}`);
  
  return selectedImage.uri;
};

// Función para asignar categorías y procesar transacciones extraídas
export const processTransactions = (
  transactions: any[], 
  addLog: (message: string) => void
): PartialTransaction[] => {
  // Añadir selección y categorías
  return transactions.map((transaction, index) => {
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
};