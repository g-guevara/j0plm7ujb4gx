// app/services/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Category, Transaction, cardData, categoryData, transactionData } from '../data/sampleData';

// Keys for storing data in AsyncStorage
const TRANSACTIONS_STORAGE_KEY = 'finance_tracker_transactions';
const CARDS_STORAGE_KEY = 'finance_tracker_cards';
const CATEGORIES_STORAGE_KEY = 'finance_tracker_categories';
const SELECTED_CARD_KEY = 'finance_tracker_selected_card';

// No default cards - start with empty array
const DEFAULT_CARDS: Card[] = [];

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 1,
    name: "Health",
    icon: "medical-outline",
    color: "#2980b9" // Blue
  },
  {
    id: 2,
    name: "Food",
    icon: "restaurant-outline",
    color: "#27ae60" // Dark green
  },
  {
    id: 3,
    name: "Shopping",
    icon: "bag-outline",
    color: "#9b59b6" // Purple
  },
  {
    id: 4,
    name: "Housing",
    icon: "home-outline",
    color: "#3498db" // Light blue
  },
  {
    id: 5,
    name: "Transportation",
    icon: "car-outline",
    color: "#1abc9c" // Teal
  },
  {
    id: 6,
    name: "Life and Entertainment",
    icon: "film-outline",
    color: "#6c5ce7" // Light purple
  },
  {
    id: 7,
    name: "Financial Expenses",
    icon: "receipt-outline",
    color: "#34495e" // Dark blue-gray
  },
  {
    id: 8,
    name: "Income",
    icon: "trending-up-outline",
    color: "#2ecc71" // Green
  },
  {
    id: 9,
    name: "Clothes",
    icon: "shirt-outline",
    color: "#74b9ff" // Sky blue
  },
  {
    id: 10,
    name: "Software",
    icon: "code-outline",
    color: "#8e44ad" // Dark purple
  },
  {
    id: 11,
    name: "Investments",
    icon: "trending-up",
    color: "#16a085" // Dark teal
  },
  {
    id: 12,
    name: "Others",
    icon: "cube-outline",
    color: "#007aff" // Blue (Apple system blue)
  }
];

/**
 * Initialize storage with default data if empty
 */
export const initializeStorage = async (): Promise<void> => {
  try {
    // Check if cards exist
    const existingCards = await AsyncStorage.getItem(CARDS_STORAGE_KEY);
    
    if (existingCards) {
      // Load existing cards into memory
      const cards = JSON.parse(existingCards);
      cardData.length = 0; // Clear the array
      cardData.push(...cards);
      console.log(`Loaded ${cards.length} existing cards`);
    } else {
      // Start with no cards - user will need to add them
      cardData.length = 0;
      console.log('No cards found, starting with empty card list');
    }
    
    // Check if categories exist
    const existingCategories = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
    
    // If no categories exist, create default categories
    if (!existingCategories) {
      console.log('No categories found, creating default categories');
      await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      categoryData.push(...DEFAULT_CATEGORIES);
    } else {
      // Load existing categories into memory
      const categories = JSON.parse(existingCategories);
      categoryData.length = 0; // Clear the array
      categoryData.push(...categories);
    }
    
    // Load transactions
    const existingTransactions = await AsyncStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (existingTransactions) {
      const transactions = JSON.parse(existingTransactions);
      transactionData.length = 0; // Clear the array
      transactionData.push(...transactions);
    }
    
    // Only load selected card if there are cards available
    if (cardData.length > 0) {
      const selectedCardId = await AsyncStorage.getItem(SELECTED_CARD_KEY);
      if (selectedCardId) {
        selectCard(parseInt(selectedCardId, 10));
      }
    }
    
    console.log(`Loaded ${cardData.length} cards, ${categoryData.length} categories, and ${transactionData.length} transactions`);
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

/**
 * Save all transactions to storage
 */
export const saveAllTransactions = async (): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactionData));
    return true;
  } catch (error) {
    console.error('Error saving transactions:', error);
    return false;
  }
};

/**
 * Save all cards to storage
 */
export const saveAllCards = async (): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cardData));
    return true;
  } catch (error) {
    console.error('Error saving cards:', error);
    return false;
  }
};

/**
 * Save all categories to storage
 */
export const saveAllCategories = async (): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categoryData));
    return true;
  } catch (error) {
    console.error('Error saving categories:', error);
    return false;
  }
};

/**
 * Add a new transaction and save to storage
 */
export const saveTransaction = async (transaction: Transaction): Promise<boolean> => {
  try {
    transactionData.push(transaction);
    return await saveAllTransactions();
  } catch (error) {
    console.error('Error saving transaction:', error);
    return false;
  }
};

/**
 * Add a new card and save to storage
 */
export const saveCard = async (card: Card): Promise<boolean> => {
  try {
    cardData.push(card);
    return await saveAllCards();
  } catch (error) {
    console.error('Error saving card:', error);
    return false;
  }
};

/**
 * Add a new category and save to storage
 */
export const saveCategory = async (category: Category): Promise<boolean> => {
  try {
    categoryData.push(category);
    return await saveAllCategories();
  } catch (error) {
    console.error('Error saving category:', error);
    return false;
  }
};

/**
 * Update a card and save to storage
 */
export const updateCard = async (updatedCard: Card): Promise<boolean> => {
  try {
    const index = cardData.findIndex(card => card.id === updatedCard.id);
    if (index !== -1) {
      cardData[index] = updatedCard;
    } else {
      cardData.push(updatedCard);
    }
    return await saveAllCards();
  } catch (error) {
    console.error('Error updating card:', error);
    return false;
  }
};

/**
 * Update a category and save to storage
 */
export const updateCategory = async (updatedCategory: Category): Promise<boolean> => {
  try {
    const index = categoryData.findIndex(category => category.id === updatedCategory.id);
    if (index !== -1) {
      categoryData[index] = updatedCategory;
      return await saveAllCategories();
    }
    return false;
  } catch (error) {
    console.error('Error updating category:', error);
    return false;
  }
};

/**
 * Delete a card and save to storage
 */
export const deleteCard = async (cardId: number): Promise<boolean> => {
  try {
    const index = cardData.findIndex(card => card.id === cardId);
    if (index !== -1) {
      cardData.splice(index, 1);
      return await saveAllCards();
    }
    return false;
  } catch (error) {
    console.error('Error deleting card:', error);
    return false;
  }
};

/**
 * Delete a category and save to storage
 */
export const deleteCategoryById = async (categoryId: number): Promise<boolean> => {
  try {
    const index = categoryData.findIndex(category => category.id === categoryId);
    if (index !== -1) {
      categoryData.splice(index, 1);
      return await saveAllCategories();
    }
    return false;
  } catch (error) {
    console.error('Error deleting category:', error);
    return false;
  }
};

/**
 * Delete a transaction and save to storage
 */
export const deleteTransaction = async (transactionId: number): Promise<boolean> => {
  try {
    const index = transactionData.findIndex(t => t.id === transactionId);
    if (index !== -1) {
      transactionData.splice(index, 1);
      return await saveAllTransactions();
    }
    return false;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return false;
  }
};

/**
 * Update a transaction and save to storage
 */
export const updateTransaction = async (updatedTransaction: Transaction): Promise<boolean> => {
  try {
    const index = transactionData.findIndex(t => t.id === updatedTransaction.id);
    if (index !== -1) {
      transactionData[index] = updatedTransaction;
      return await saveAllTransactions();
    }
    return false;
  } catch (error) {
    console.error('Error updating transaction:', error);
    return false;
  }
};

/**
 * Select a card and save the selection to storage
 */
export const selectCard = (cardId: number): Promise<boolean> => {
  // Update selection status in memory
  cardData.forEach(card => {
    card.selected = card.id === cardId;
  });
  
  // Save selected card ID and updated cards to storage
  return Promise.all([
    AsyncStorage.setItem(SELECTED_CARD_KEY, cardId.toString()),
    saveAllCards()
  ])
    .then(() => true)
    .catch(error => {
      console.error('Error selecting card:', error);
      return false;
    });
};

/**
 * Get all transactions
 */
export const getAllTransactions = (): Transaction[] => {
  return [...transactionData];
};

/**
 * Get all cards
 */
export const getAllCards = (): Card[] => {
  return [...cardData];
};

/**
 * Get all categories
 */
export const getAllCategories = (): Category[] => {
  return [...categoryData];
};

/**
 * Get transaction by ID
 */
export const getTransactionById = (id: number): Transaction | undefined => {
  return transactionData.find(t => t.id === id);
};

/**
 * Get card by ID
 */
export const getCardById = (id: number): Card | undefined => {
  return cardData.find(c => c.id === id);
};

/**
 * Get category by ID
 */
export const getCategoryById = (id: number): Category | undefined => {
  return categoryData.find(c => c.id === id);
};

/**
 * Get category by name
 */
export const getCategoryByName = (name: string): Category | undefined => {
  return categoryData.find(c => c.name.toLowerCase() === name.toLowerCase());
};

/**
 * Get the selected card
 */
export const getSelectedCard = (): Card | undefined => {
  return cardData.find(card => card.selected);
};

/**
 * Add a new transaction to memory and storage
 */
export const addNewTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<number> => {
  // Generate a new ID
  const newId = transactionData.length > 0 
    ? Math.max(...transactionData.map(t => t.id)) + 1 
    : 1;
  
  // Create the complete transaction
  const newTransaction: Transaction = {
    ...transaction,
    id: newId
  };
  
  // Add to memory array
  transactionData.push(newTransaction);
  
  // Save to storage
  await saveAllTransactions();
  
  // Return the new ID
  return newId;
};

/**
 * Add a new card to memory and storage
 */
export const addNewCard = async (name: string, color: string): Promise<Card> => {
  // Generate a new ID
  const newId = cardData.length > 0 
    ? Math.max(...cardData.map(c => c.id)) + 1 
    : 1;
  
  // Create the new card
  const newCard: Card = {
    id: newId,
    name,
    color,
    selected: cardData.length === 0 // Auto-select if this is the first card
  };
  
  // Add to memory array
  cardData.push(newCard);
  
  // Save to storage
  await saveAllCards();
  
  // If this is the first card, save it as selected
  if (cardData.length === 1) {
    await AsyncStorage.setItem(SELECTED_CARD_KEY, newId.toString());
  }
  
  // Return the new card
  return newCard;
};

/**
 * Add a new category to memory and storage
 */
export const addNewCategory = async (name: string, icon: string, color: string): Promise<Category> => {
  // Generate a new ID
  const newId = categoryData.length > 0 
    ? Math.max(...categoryData.map(c => c.id)) + 1 
    : 1;
  
  // Create the new category
  const newCategory: Category = {
    id: newId,
    name,
    icon,
    color
  };
  
  // Add to memory array
  categoryData.push(newCategory);
  
  // Save to storage
  await saveAllCategories();
  
  // Return the new category
  return newCategory;
};

/**
 * Check if a category is being used by any transactions
 */
export const isCategoryInUse = (categoryName: string): boolean => {
  return transactionData.some(transaction => 
    transaction.category.toLowerCase() === categoryName.toLowerCase()
  );
};

// Export default to maintain compatibility with existing imports
export default {
  initializeStorage,
  saveAllTransactions,
  saveAllCards,
  saveAllCategories,
  saveTransaction,
  saveCard,
  saveCategory,
  updateCard,
  updateCategory,
  deleteCard,
  deleteCategoryById,
  deleteTransaction,
  updateTransaction,
  selectCard,
  getAllTransactions,
  getAllCards,
  getAllCategories,
  getTransactionById,
  getCardById,
  getCategoryById,
  getCategoryByName,
  getSelectedCard,
  addNewTransaction,
  addNewCard,
  addNewCategory,
  isCategoryInUse
};