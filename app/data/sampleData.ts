// app/data/sampleData.ts
// Contains type definitions and helper functions (no sample data)

// Definición de interfaces para transacciones
export interface Transaction {
  id: number;
  date: string;
  category: string;
  name: string;
  mount: number;
  cardId?: number; 
}

export interface PartialTransaction {
  id?: number;
  date?: string;
  category?: string;
  name?: string;
  mount?: number;
  cardId?: number;
  selected?: boolean;
}

// Card interface
export interface Card {
  id: number;
  name: string;
  color: string;
  selected?: boolean;
}

// Category interface
export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

// Empty arrays for transactions, cards, and categories
export let transactionData: Transaction[] = [];
export let cardData: Card[] = [];
export let categoryData: Category[] = [];

// Function to get the currently selected card
export function getSelectedCard(): Card | undefined {
  return cardData.find(card => card.selected);
}

// Function to select a card
export function selectCard(cardId: number): void {
  cardData.forEach(card => {
    card.selected = card.id === cardId;
  });
}

// Function to add a new card
export function addCard(name: string, color: string): Card {
  const newId = cardData.length > 0 ? Math.max(...cardData.map(c => c.id)) + 1 : 1;
  const newCard: Card = {
    id: newId,
    name,
    color,
    selected: false
  };
  cardData.push(newCard);
  return newCard;
}

// Function to add a transaction
export function addTransaction(transaction: PartialTransaction): number {
  // Create a new transaction with default values for missing fields
  const newTransaction: Transaction = {
    id: transaction.id || (transactionData.length > 0 ? Math.max(...transactionData.map(t => t.id)) + 1 : 1),
    date: transaction.date || new Date().toISOString().split('T')[0],
    category: transaction.category || "Others",
    name: transaction.name || "Unnamed Transaction",
    mount: transaction.mount || 0,
    cardId: transaction.cardId
  };

  // Add to the transactions array
  transactionData.push(newTransaction);
  
  // Return the ID of the new transaction
  return newTransaction.id;
}

// Function to add a new category
export function addCategory(name: string, icon: string, color: string): Category {
  const newId = categoryData.length > 0 ? Math.max(...categoryData.map(c => c.id)) + 1 : 1;
  const newCategory: Category = {
    id: newId,
    name,
    icon,
    color
  };
  categoryData.push(newCategory);
  return newCategory;
}

// Function to update a category
export function updateCategory(categoryId: number, name: string, icon: string, color: string): boolean {
  const index = categoryData.findIndex(cat => cat.id === categoryId);
  if (index !== -1) {
    categoryData[index] = {
      ...categoryData[index],
      name,
      icon,
      color
    };
    return true;
  }
  return false;
}

// Function to delete a category
export function deleteCategory(categoryId: number): boolean {
  const index = categoryData.findIndex(cat => cat.id === categoryId);
  if (index !== -1) {
    categoryData.splice(index, 1);
    return true;
  }
  return false;
}

// Function to get category by name
export function getCategoryByName(name: string): Category | undefined {
  return categoryData.find(cat => cat.name.toLowerCase() === name.toLowerCase());
}

// Export default to maintain compatibility with existing imports
export default { 
  transactionData, 
  cardData, 
  categoryData,
  addTransaction, 
  addCard, 
  addCategory,
  updateCategory,
  deleteCategory,
  selectCard, 
  getSelectedCard,
  getCategoryByName
};