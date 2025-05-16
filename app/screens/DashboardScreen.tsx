import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { cardData, transactionData } from "../data/sampleData";

export default function DashboardScreen() {
  const [totalAmount, setTotalAmount] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState(transactionData.slice(0, 3));

  useEffect(() => {
    // Calculate total amount across all cards
    const total = transactionData.reduce((sum, transaction) => sum + transaction.mount, 0);
    setTotalAmount(total);

    // Get recent transactions (latest 3)
    const sorted = [...transactionData].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setRecentTransactions(sorted.slice(0, 3));
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return "$" + amount.toFixed(2);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Your financial overview</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Total Expenses</Text>
        <Text style={styles.summaryAmount}>{formatCurrency(totalAmount)}</Text>
        <View style={styles.cardList}>
          {cardData.map((card) => (
            <View 
              key={card.id} 
              style={[styles.cardIndicator, { backgroundColor: card.color + '20', borderColor: card.color }]}
            >
              <View style={[styles.cardDot, { backgroundColor: card.color }]} />
              <Text style={[styles.cardName, { color: card.color }]}>{card.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <Text style={styles.viewAllText}>View All</Text>
      </View>

      {recentTransactions.map((transaction) => {
        const card = cardData.find(c => c.id === transaction.cardId);
        
        return (
          <View key={transaction.id} style={styles.transactionItem}>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionName}>{transaction.name}</Text>
              <Text style={styles.transactionCategory}>{transaction.category}</Text>
              {card && (
                <View style={[styles.cardTag, { backgroundColor: card.color + '20' }]}>
                  <Text style={[styles.cardTagText, { color: card.color }]}>{card.name}</Text>
                </View>
              )}
            </View>
            <Text style={styles.transactionAmount}>
              {formatCurrency(transaction.mount)}
            </Text>
          </View>
        );
      })}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Spending Analysis</Text>
      </View>

      <View style={styles.chartPlaceholder}>
        <Text style={styles.chartPlaceholderText}>
          Spending trend visualization will appear here
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop:95, // Increased padding for both platforms
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666666",
  },
  summaryCard: {
    margin: 16,
    padding: 20,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 16,
  },
  cardList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cardIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  cardName: {
    fontWeight: "600",
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  viewAllText: {
    fontSize: 14,
    color: "#3498db",
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  cardTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardTagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  chartPlaceholder: {
    margin: 16,
    height: 200,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  chartPlaceholderText: {
    color: "#666666",
    fontSize: 14,
  },
});