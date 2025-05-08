import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Transaction, transactionData } from "./data/sampleData";

export default function HomeScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>(transactionData);

  // Cargar todas las transacciones (incluidas las escaneadas)
  useEffect(() => {
    // En una implementación real, aquí cargaríamos las transacciones guardadas
    setTransactions(transactionData);
  }, []);

  // Navigate to details screen with transaction data
  const handleTransactionPress = (transaction: Transaction) => {
    router.push({
      pathname: "/details",
      params: { transactionId: transaction.id.toString() }
    });
  };

  // Navigate to scan screen
  const handleScanPress = () => {
    router.push("/scan");
  };
  
  // Navigate to debug scan screen
  const handleDebugScanPress = () => {
    router.push("/scan-debug");
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return "$" + amount.toFixed(2);
  };

  // Render each transaction item
  const renderItem = ({ item }: { item: Transaction }) => {
    return (
      <TouchableOpacity
        style={styles.transactionCard}
        onPress={() => handleTransactionPress(item)}
      >
        <View style={styles.leftContent}>
          <Text style={styles.transactionName}>{item.name}</Text>
          <Text style={styles.transactionCategory}>{item.category}</Text>
          <Text style={styles.transactionDate}>{item.date}</Text>
        </View>
        <View style={styles.rightContent}>
          <Text style={styles.transactionAmount}>
            {formatCurrency(item.mount)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Calculate total amount of all transactions
  const totalAmount = transactions.reduce((sum, item) => sum + item.mount, 0);

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Total Transactions</Text>
        <Text style={styles.summaryAmount}>{formatCurrency(totalAmount)}</Text>
        <Text style={styles.summaryCount}>{transactions.length} transactions</Text>
      </View>
      
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />

      {/* Botón flotante para escanear recibos */}
      <TouchableOpacity 
        style={styles.scanButton}
        onPress={handleScanPress}
      >
        <Ionicons name="scan" size={24} color="white" />
      </TouchableOpacity>
      
      {/* Botón flotante para versión debug de escaneo */}
      <TouchableOpacity 
        style={styles.debugButton}
        onPress={handleDebugScanPress}
      >
        <Ionicons name="bug" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  summaryCard: {
    backgroundColor: "#3498db",
    padding: 20,
    margin: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  transactionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  leftContent: {
    flex: 1,
  },
  rightContent: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  transactionName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: "#888",
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2ecc71",
  },
  scanButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  debugButton: {
    position: "absolute",
    bottom: 20,
    right: 90, // Posicionado a la izquierda del botón de escaneo normal
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e74c3c", // Color rojo para indicar modo debug
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});