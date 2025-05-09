import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, cardData, Transaction, transactionData } from '../data/sampleData';

// Clave para almacenar las transacciones en AsyncStorage
const TRANSACTIONS_STORAGE_KEY = 'app_transactions';
const CARDS_STORAGE_KEY = 'app_cards';

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

// Cargar tarjetas desde el almacenamiento
export const loadCards = async (): Promise<Card[]> => {
  try {
    const storedData = await AsyncStorage.getItem(CARDS_STORAGE_KEY);
    
    if (storedData) {
      // Combinar datos almacenados con datos de muestra
      const parsedData: Card[] = JSON.parse(storedData);
      return [...cardData, ...parsedData];
    }
    
    // Si no hay datos almacenados, usar solo los datos de muestra
    return [...cardData];
  } catch (error) {
    console.error('Error al cargar tarjetas:', error);
    return [...cardData];
  }
};

// Guardar una nueva tarjeta
export const saveCard = async (card: Card): Promise<boolean> => {
  try {
    // Obtener tarjetas existentes
    const storedData = await AsyncStorage.getItem(CARDS_STORAGE_KEY);
    let cards: Card[] = storedData ? JSON.parse(storedData) : [];
    
    // Agregar la nueva tarjeta
    cards.push(card);
    
    // Guardar en AsyncStorage
    await AsyncStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cards));
    
    return true;
  } catch (error) {
    console.error('Error al guardar tarjeta:', error);
    return false;
  }
};

// Actualizar una tarjeta existente (por ejemplo, para cambiar su estado de selección)
export const updateCard = async (updatedCard: Card): Promise<boolean> => {
  try {
    // Obtener tarjetas existentes
    const storedData = await AsyncStorage.getItem(CARDS_STORAGE_KEY);
    let cards: Card[] = storedData ? JSON.parse(storedData) : [];
    
    // Encontrar y actualizar la tarjeta
    const index = cards.findIndex(card => card.id === updatedCard.id);
    if (index !== -1) {
      cards[index] = updatedCard;
    } else {
      // Si no existe, agregarla
      cards.push(updatedCard);
    }
    
    // Guardar en AsyncStorage
    await AsyncStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cards));
    
    return true;
  } catch (error) {
    console.error('Error al actualizar tarjeta:', error);
    return false;
  }
};

// Obtener todas las transacciones (combinando datos en memoria y almacenados)
export const getAllTransactions = async (): Promise<Transaction[]> => {
  return await loadTransactions();
};

// Obtener todas las tarjetas (combinando datos en memoria y almacenados)
export const getAllCards = async (): Promise<Card[]> => {
  return await loadCards();
};

// Exportación por defecto para solucionar la advertencia de rutas
export default { 
  loadTransactions, 
  saveTransaction, 
  getAllTransactions, 
  loadCards, 
  saveCard, 
  updateCard, 
  getAllCards 
};