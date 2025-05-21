// app/data/sampleData.ts
// Contains only type definitions and helper functions (no sample data)

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

// Empty arrays for transactions and cards
export let transactionData: Transaction[] = [];
export let cardData: Card[] = [];

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
    category: transaction.category || "Otros",
    name: transaction.name || "Transacción sin nombre",
    mount: transaction.mount || 0,
    cardId: transaction.cardId
  };

  // Add to the transactions array
  transactionData.push(newTransaction);
  
  // Return the ID of the new transaction
  return newTransaction.id;
}

// Export default to maintain compatibility with existing imports
export default { 
  transactionData, 
  cardData, 
  addTransaction, 
  addCard, 
  selectCard, 
  getSelectedCard 
};