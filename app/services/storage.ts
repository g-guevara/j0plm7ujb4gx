import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, transactionData } from '../data/sampleData';

// Clave para almacenar las transacciones en AsyncStorage
const TRANSACTIONS_STORAGE_KEY = 'app_transactions';

// Cargar transacciones desde el almacenamiento
export const loadTransactions = async (): Promise<Transaction[]> => {
  try {
    const storedData = await AsyncStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    
    if (storedData) {
      // Combinar datos almacenados con datos de muestra
      const parsedData: Transaction[] = JSON.parse(storedData);
      return [...transactionData, ...parsedData];
    }
    
    // Si no hay datos almacenados, usar solo los datos de muestra
    return [...transactionData];
  } catch (error) {
    console.error('Error al cargar transacciones:', error);
    return [...transactionData];
  }
};

// Guardar una nueva transacción
export const saveTransaction = async (transaction: Transaction): Promise<boolean> => {
  try {
    // Obtener transacciones existentes
    const storedData = await AsyncStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    let transactions: Transaction[] = storedData ? JSON.parse(storedData) : [];
    
    // Agregar la nueva transacción
    transactions.push(transaction);
    
    // Guardar en AsyncStorage
    await AsyncStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
    
    return true;
  } catch (error) {
    console.error('Error al guardar transacción:', error);
    return false;
  }
};

// Obtener todas las transacciones (combinando datos en memoria y almacenados)
export const getAllTransactions = async (): Promise<Transaction[]> => {
  return await loadTransactions();
};

// Exportación por defecto para solucionar la advertencia de rutas
export default { loadTransactions, saveTransaction, getAllTransactions };