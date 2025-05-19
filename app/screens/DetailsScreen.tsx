import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Card, cardData, transactionData } from "../data/sampleData";

export default function DetailsScreen() {
  // Get the transactionId parameter from the URL
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  
  // Find the transaction with the matching ID
  const transactionIndex = transactionData.findIndex(t => t.id === Number(transactionId));
  const transaction = transactionData[transactionIndex];

  // State for editing mode
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(transaction?.name || "");
  const [editedCategory, setEditedCategory] = useState(transaction?.category || "");
  const [editedDate, setEditedDate] = useState(transaction ? new Date(transaction.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCardPicker, setShowCardPicker] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(transaction?.cardId || 1);

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

  // Handle date change
  const onDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEditedDate(selectedDate);
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // Reset form values if canceling edit
      setEditedName(transaction?.name || "");
      setEditedCategory(transaction?.category || "");
      setEditedDate(transaction ? new Date(transaction.date) : new Date());
    }
    setIsEditing(!isEditing);
  };

  // Handle card selection
  const handleCardSelect = (cardId: number) => {
    setSelectedCardId(cardId);
    setShowCardPicker(false);
  };

  // Render card item
  const renderCardItem = ({ item }: { item: Card }) => (
    <TouchableOpacity 
      style={[
        styles.cardItem, 
        { backgroundColor: item.color },
        item.id === selectedCardId && styles.selectedCardItem
      ]}
      onPress={() => handleCardSelect(item.id)}
    >
      <Text style={styles.cardItemName}>{item.name}</Text>
      {item.id === selectedCardId && (
        <View style={styles.selectedCardCheck}>
          <Ionicons name="checkmark-circle" size={20} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );

  // Save edited transaction
  const saveTransaction = () => {
    if (!editedName.trim()) {
      Alert.alert("Error", "Transaction name cannot be empty");
      return;
    }

    if (!editedCategory.trim()) {
      Alert.alert("Error", "Category cannot be empty");
      return;
    }

    // Update transaction in data source
    if (transaction && transactionIndex !== -1) {
      // Format date as YYYY-MM-DD
      const formattedDate = editedDate.toISOString().split('T')[0];
      
      // Create updated transaction
      const updatedTransaction = {
        ...transaction,
        name: editedName,
        category: editedCategory,
        date: formattedDate,
        cardId: selectedCardId
      };
      
      // Update in the data array
      transactionData[transactionIndex] = updatedTransaction;
      
      // Exit edit mode
      setIsEditing(false);
      
      Alert.alert("Success", "Transaction updated successfully");
    }
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
      {/* Section Title with Edit Button */}
      <View style={styles.titleContainer}>
        <Text style={styles.sectionTitle}>Transaction Details</Text>
        
        <TouchableOpacity 
          style={styles.editButton}
          onPress={isEditing ? saveTransaction : toggleEditMode}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? "Save" : "Edit"}
          </Text>
        </TouchableOpacity>
        
        {isEditing && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={toggleEditMode}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

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
        <View style={styles.detailsCard}>
          {/* Name */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.inputField}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Transaction name"
              />
            ) : (
              <Text style={styles.detailValue}>{transaction.name}</Text>
            )}
          </View>
          
          <View style={styles.separator} />
          
          {/* Category */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            {isEditing ? (
              <TextInput
                style={styles.inputField}
                value={editedCategory}
                onChangeText={setEditedCategory}
                placeholder="Category"
              />
            ) : (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{transaction.category}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.separator} />
          
          {/* Date */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            {isEditing ? (
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.datePickerText}>
                  {editedDate.toLocaleDateString()}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#3498db" />
              </TouchableOpacity>
            ) : (
              <Text style={styles.detailValue}>{formatDate(transaction.date)}</Text>
            )}
          </View>
          
          {/* Show date picker when needed */}
          {showDatePicker && (
            <DateTimePicker
              value={editedDate}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
          
          <View style={styles.separator} />
          
          {/* Transaction ID (non-editable) */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID</Text>
            <Text style={styles.detailValue}>{transaction.id}</Text>
          </View>

          {card && (
            <>
              <View style={styles.separator} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Card</Text>
                {isEditing ? (
                  <TouchableOpacity 
                    style={[styles.cardSelector, { borderColor: card.color }]}
                    onPress={() => setShowCardPicker(true)}
                  >
                    <View style={[styles.cardDot, { backgroundColor: card.color }]} />
                    <Text style={[styles.cardChipText, { color: card.color }]}>{card.name}</Text>
                    <Ionicons name="chevron-down" size={16} color={card.color} style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.cardChip, { backgroundColor: card.color + '20', borderColor: card.color }]}>
                    <View style={[styles.cardDot, { backgroundColor: card.color }]} />
                    <Text style={[styles.cardChipText, { color: card.color }]}>{card.name}</Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </View>

      {/* Card Picker Modal */}
      <Modal
        visible={showCardPicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Card</Text>
            
            <FlatList
              data={cardData}
              renderItem={renderCardItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.cardsList}
            />
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowCardPicker(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
                    <Text style={[styles.similarCardText, { color: similarCard.color }]}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 12,
  },
  editButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: "white",
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#95a5a6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "600",
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
  inputField: {
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 180,
    backgroundColor: "#fff",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  datePickerText: {
    fontSize: 16,
    color: "#333",
    marginRight: 8,
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
  cardSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "#fff",
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
  similarCardText: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
  },
  similarAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2ecc71",
  },
  errorText: {
    fontSize: 18,
    color: "#C62828",
    textAlign: "center",
    marginTop: 40,
  },
  // Card Picker Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  cardsList: {
    paddingVertical: 8,
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedCardItem: {
    borderWidth: 2,
    borderColor: "white",
  },
  cardItemName: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  selectedCardCheck: {
    backgroundColor: "transparent",
  },
  closeButton: {
    backgroundColor: "#95a5a6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});