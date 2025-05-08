// Este archivo contiene nuestros datos de muestra con la estructura:
// date, category, name, mount (monto monetario)

// Definición de interfaces para transacciones
export interface Transaction {
    id: number;
    date: string;
    category: string;
    name: string;
    mount: number;
  }
  
  export interface PartialTransaction {
    id?: number;
    date?: string;
    category?: string;
    name?: string;
    mount?: number;
  }
  
  // Función auxiliar para agregar nuevas transacciones
  export function addTransaction(transaction: PartialTransaction) {
    // Validar y completar campos faltantes con valores predeterminados
    const newTransaction: Transaction = {
      id: transaction.id || Math.max(...transactionData.map(t => t.id)) + 1,
      date: transaction.date || new Date().toISOString().split('T')[0],
      category: transaction.category || "Otros",
      name: transaction.name || "Transacción sin nombre",
      mount: transaction.mount || 0
    };
  
    // Agregar a la lista de transacciones
    transactionData.push(newTransaction);
    
    // Devolver el ID de la nueva transacción
    return newTransaction.id;
  }
  
  // Datos de transacciones de muestra - puedes reemplazarlos con los tuyos propios
  export const transactionData: Transaction[] = [
    {
      id: 1,
      date: "2025-05-01",
      category: "Groceries",
      name: "Supermarket Shopping",
      mount: 85.42
    },
    {
      id: 2,
      date: "2025-05-02",
      category: "Entertainment",
      name: "Movie Tickets",
      mount: 24.99
    },
    {
      id: 3,
      date: "2025-05-03",
      category: "Bills",
      name: "Electricity Bill",
      mount: 128.75
    },
    {
      id: 4,
      date: "2025-05-03",
      category: "Transportation",
      name: "Gas Station",
      mount: 45.30
    },
    {
      id: 5,
      date: "2025-05-04",
      category: "Dining",
      name: "Restaurant Dinner",
      mount: 78.50
    },
    {
      id: 6,
      date: "2025-05-05",
      category: "Shopping",
      name: "Clothing Store",
      mount: 132.99
    },
    {
      id: 7,
      date: "2025-05-06",
      category: "Healthcare",
      name: "Pharmacy",
      mount: 37.25
    },
    {
      id: 8,
      date: "2025-05-06",
      category: "Groceries",
      name: "Local Market",
      mount: 42.18
    },
    {
      id: 9,
      date: "2025-05-07",
      category: "Bills",
      name: "Internet Service",
      mount: 59.99
    },
    {
      id: 10,
      date: "2025-05-07",
      category: "Entertainment",
      name: "Online Subscription",
      mount: 14.99
    }
  ];
  
  // Exportación por defecto para solucionar la advertencia de rutas
  export default { transactionData, addTransaction };