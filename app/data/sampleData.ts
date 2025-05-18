// Este archivo contiene nuestros datos de muestra con la estructura:
// date, category, name, mount (monto monetario)

// Definición de interfaces para transacciones
export interface Transaction {
    id: number;
    date: string;
    category: string;
    name: string;
    mount: number;
    cardId?: number; // Link transactions to cards
  }
  
  export interface PartialTransaction {
    id?: number;
    date?: string;
    category?: string;
    name?: string;
    mount?: number;
    cardId?: number; // Link transactions to cards
    selected?: boolean;
  }

  // Card interface and sample data
  export interface Card {
    id: number;
    name: string;
    color: string;
    selected?: boolean;
  }
  
  // Función auxiliar para agregar nuevas transacciones
  export function addTransaction(transaction: PartialTransaction) {
    // Validar y completar campos faltantes con valores predeterminados
    const newTransaction: Transaction = {
      id: transaction.id || Math.max(...transactionData.map(t => t.id)) + 1,
      date: transaction.date || new Date().toISOString().split('T')[0],
      category: transaction.category || "Otros",
      name: transaction.name || "Transacción sin nombre",
      mount: transaction.mount || 0,
      cardId: transaction.cardId
    };
  
    // Agregar a la lista de transacciones
    transactionData.push(newTransaction);
    
    // Devolver el ID de la nueva transacción
    return newTransaction.id;
  }

  // Sample card data - ahora es mutable, no const
  export let cardData: Card[] = [
    {
      id: 1,
      name: "Personal Card",
      color: "#3498db",
      selected: true
    },
    {
      id: 2, 
      name: "Business Card",
      color: "#2ecc71",
      selected: false
    },
    {
      id: 3,
      name: "Family Card",
      color: "#e74c3c",
      selected: false
    }
  ];

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
    const newId = Math.max(...cardData.map(c => c.id)) + 1;
    const newCard: Card = {
      id: newId,
      name,
      color,
      selected: false
    };
    cardData.push(newCard);
    return newCard;
  }
  
  // Datos de transacciones de muestra - puedes reemplazarlos con los tuyos propios
  export const transactionData: Transaction[] = [
    {
      id: 1,
      date: "2025-05-01",
      category: "Groceries",
      name: "Supermarket Shopping",
      mount: 85.42,
      cardId: 1
    },
    {
      id: 2,
      date: "2025-05-02",
      category: "Entertainment",
      name: "Movie Tickets",
      mount: 24.99,
      cardId: 1
    },
    {
      id: 3,
      date: "2025-05-03",
      category: "Bills",
      name: "Electricity Bill",
      mount: 128.75,
      cardId: 3
    },
    {
      id: 4,
      date: "2025-05-03",
      category: "Transportation",
      name: "Gas Station",
      mount: 45.30,
      cardId: 2
    },
    {
      id: 5,
      date: "2025-05-04",
      category: "Dining",
      name: "Restaurant Dinner",
      mount: 78.50,
      cardId: 1
    },
    {
      id: 6,
      date: "2025-05-05",
      category: "Shopping",
      name: "Clothing Store",
      mount: 132.99,
      cardId: 3
    },
    {
      id: 7,
      date: "2025-05-06",
      category: "Healthcare",
      name: "Pharmacy",
      mount: 37.25,
      cardId: 2
    },
    {
      id: 8,
      date: "2025-05-06",
      category: "Groceries",
      name: "Local Market",
      mount: 42.18,
      cardId: 3
    },
    {
      id: 9,
      date: "2025-05-07",
      category: "Bills",
      name: "Internet Service",
      mount: 59.99,
      cardId: 1
    },
    {
      id: 10,
      date: "2025-05-07",
      category: "Entertainment",
      name: "Online Subscription",
      mount: 14.99,
      cardId: 2
    }
  ];
  
  // Exportación por defecto para solucionar la advertencia de rutas
  export default { transactionData, cardData, addTransaction, addCard, selectCard, getSelectedCard };