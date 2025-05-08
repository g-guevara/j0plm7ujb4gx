import { Router } from "expo-router";
import { Alert } from "react-native";
import { transactionData } from "../data/sampleData";
import { PartialTransaction } from "./imageUtils";

/**
 * Alterna la selección de todas las transacciones
 */
export const toggleSelectAll = (
  select: boolean,
  scannedTransactions: PartialTransaction[],
  setScannedTransactions: (transactions: PartialTransaction[]) => void,
  addLog: (message: string) => void
) => {
  addLog(`Seleccionando todas las transacciones: ${select}`);
  const updatedTransactions = scannedTransactions.map(transaction => ({
    ...transaction,
    selected: select
  }));
  setScannedTransactions(updatedTransactions);
  addLog("Estado actualizado con selección de todas las transacciones");
};

/**
 * Alterna la selección de una transacción específica
 */
export const toggleTransaction = (
  index: number,
  scannedTransactions: PartialTransaction[],
  setScannedTransactions: (transactions: PartialTransaction[]) => void,
  addLog: (message: string) => void
) => {
  addLog(`Alternando selección de transacción #${index}`);
  const updatedTransactions = [...scannedTransactions];
  updatedTransactions[index] = {
    ...updatedTransactions[index],
    selected: !updatedTransactions[index].selected
  };
  setScannedTransactions(updatedTransactions);
  addLog(`Transacción #${index} ahora está ${updatedTransactions[index].selected ? 'seleccionada' : 'deseleccionada'}`);
};

/**
 * Guarda las transacciones seleccionadas
 */
export const saveTransactions = async (
  scannedTransactions: PartialTransaction[],
  addLog: (message: string) => void,
  router: Router
) => {
  const selectedTransactions = scannedTransactions.filter(t => t.selected);
  addLog(`Guardando ${selectedTransactions.length} transacciones seleccionadas`);
  
  if (selectedTransactions.length === 0) {
    addLog("ERROR: No hay transacciones seleccionadas");
    Alert.alert("Error", "No hay transacciones seleccionadas para guardar");
    return;
  }

  try {
    // Para cada transacción seleccionada
    let savedCount = 0;
    
    for (const transaction of selectedTransactions) {
      // Crear un nuevo ID para la transacción
      const newId = Math.max(...transactionData.map(t => t.id)) + 1 + savedCount;
      
      // Crear la nueva transacción completa
      const newTransaction = {
        id: newId,
        date: transaction.date || new Date().toISOString().split('T')[0],
        category: transaction.category || "Otros",
        name: transaction.name || "Transacción sin nombre",
        mount: transaction.mount || 0
      };

      // En una app real, aquí guardaríamos la transacción
      // await saveTransaction(newTransaction);
      addLog(`Guardaría transacción: ${JSON.stringify(newTransaction)}`);
      
      savedCount++;
    }
    
    Alert.alert(
      "Transacciones Guardadas",
      `Se han guardado ${savedCount} transacciones correctamente.`,
      [
        {
          text: "OK",
          onPress: () => {
            addLog("Redirigiendo a pantalla inicial");
            router.push("/");
          }
        }
      ]
    );
  } catch (error: any) {
    addLog(`ERROR al guardar: ${error.message}`);
    Alert.alert("Error", "Ocurrió un problema al guardar las transacciones");
  }
};

/**
 * Formato para montos
 */
export const formatAmount = (amount: number | undefined) => {
  if (amount === undefined) return "$0";
  
  // Determinar si es ingreso o gasto
  const isIncome = amount < 0;
  const absAmount = Math.abs(amount);
  
  const formattedAmount = '$' + absAmount.toLocaleString('es-CL');
  
  return isIncome 
    ? `+${formattedAmount}` 
    : `-${formattedAmount}`;
};

/**
 * Obtiene el estilo para el monto según sea ingreso o gasto
 */
export const getAmountStyle = (amount: number | undefined, styles: any) => {
  if (amount === undefined) return styles.expenseAmount;
  return amount < 0 ? styles.incomeAmount : styles.expenseAmount;
};