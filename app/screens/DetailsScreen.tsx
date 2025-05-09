import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { cardData, transactionData } from "../data/sampleData";

export default function DetailsScreen() {
  // Get the transactionId parameter from the URL
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  
  // Find the transaction with the matching ID
  const transaction = transactionData.find(t => t.id === Number(transactionId));

  // Format currency
  const formatCurrency = (amount: number) => {
    return "$" + amount.toFixed(2);
  };

  // Format date to be more readable
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // If no transaction is found, show an error message
  if (!transaction) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Transaction not found</Text>
      </View>
    );
  }

  // Find the card associated with this transaction
  const card = transaction.cardId ? cardData.find(c => c.id === transaction.cardId) : null;

  return (
    <ScrollView style={styles.container}>
      {/* Transaction Amount Card */}
      <View style={[styles.amountCard, card ? {backgroundColor: card.color} : {}]}>
        <Text style={styles.amountLabel}>Amount</Text>
        <Text style={styles.amountValue}>{formatCurrency(transaction.mount)}</Text>
        {card && (
          <View style={styles.cardBadge}>
            <Text style={styles.cardBadgeText}>{card.name}</Text>
          </View>
        )}
      </View>

      {/* Transaction Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction Details</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name</Text>
            <Text style={styles.detailValue}>{transaction.name}</Text>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{transaction.category}</Text>
            </View>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formatDate(transaction.date)}</Text>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID</Text>
            <Text style={styles.detailValue}>{transaction.id}</Text>
          </View>

          {card && (
            <>
              <View style={styles.separator} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Card</Text>
                <View style={[styles.cardChip, { backgroundColor: card.color + '20', borderColor: card.color }]}>
                  <View style={[styles.cardDot, { backgroundColor: card.color }]} />
                  <Text style={[styles.cardChipText, { color: card.color }]}>{card.name}</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Similar Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Similar Transactions</Text>
        {transactionData
          .filter(t => t.category === transaction.category && t.id !== transaction.id)
          .slice(0, 3)
          .map(similarTransaction => {
            // Find card for similar transaction
            const similarCard = similarTransaction.cardId ? 
              cardData.find(c => c.id === similarTransaction.cardId) : null;
              
            return (
              <View key={similarTransaction.id} style={styles.similarCard}>
                <View>
                  <Text style={styles.similarName}>{similarTransaction.name}</Text>
                  <Text style={styles.similarDate}>{similarTransaction.date}</Text>
                  {similarCard && (
                    <Text style={[styles.similarCard, { color: similarCard.color }]}>
                      {similarCard.name}
                    </Text>
                  )}
                </View>
                <Text style={styles.similarAmount}>
                  {formatCurrency(similarTransaction.mount)}
                </Text>
              </View>
            );
          })}
      </View>

      {/* Raw JSON Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Raw JSON Data</Text>
        <View style={styles.jsonCard}>
          <Text style={styles.jsonText}>
            {JSON.stringify(transaction, null, 2)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  amountCard: {
    backgroundColor: "#3498db",
    padding: 24,
    margin: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "white",
  },
  cardBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 12,
  },
  cardBadgeText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  section: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 12,
    color: "#333",
  },
  detailsCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
  },
  categoryBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: "#2E7D32",
    fontWeight: "600",
    fontSize: 14,
  },
  cardChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardChipText: {
    fontWeight: "600",
    fontSize: 14,
  },
  cardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  similarCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  similarName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  similarDate: {
    fontSize: 14,
    color: "#888",
  },
  similarAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2ecc71",
  },
  jsonCard: {
    backgroundColor: "#272822",
    borderRadius: 12,
    padding: 16,
  },
  jsonText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#F8F8F2",
  },
  errorText: {
    fontSize: 18,
    color: "#C62828",
    textAlign: "center",
    marginTop: 40,
  },
});