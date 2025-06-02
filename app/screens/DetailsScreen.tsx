import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import CategorySelectionModal from "../components/transactions/CategorySelectionModal";
import { cardData, transactionData } from "../data/sampleData";
import { applyTransactionMapping, saveTransactionMapping } from "../utils/transactionMapping";

export default function DetailsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  
  // Hide the default header
  useEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, [navigation]);
  
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
  
  // State for category selection modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Find the card associated with this transaction
  const card = cardData.find(c => c.id === (isEditing ? selectedCardId : transaction?.cardId));

  // Handle date change from date picker
  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEditedDate(selectedDate);
    }
  };

  // Handle card selection
  const handleCardSelect = (cardId: number) => {
    setSelectedCardId(cardId);
    setShowCardPicker(false);
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // Reset form values if canceling edit
      if (transaction) {
        setEditedName(transaction.name);
        setEditedCategory(transaction.category);
        setEditedDate(new Date(transaction.date));
        setSelectedCardId(transaction.cardId || 1);
      }
    }
    setIsEditing(!isEditing);
  };

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
      const allTransactions = require('../data/sampleData').transactionData;
      allTransactions[transactionIndex] = updatedTransaction;
      
      // Exit edit mode
      setIsEditing(false);
      
      Alert.alert("Success", "Transaction updated successfully");
    }
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setEditedCategory(category);
    setShowCategoryModal(false);
  };

  // Enhanced save transaction handler that also saves the mapping
  const saveTransactionWithMapping = async () => {
    // First, validate inputs
    if (!editedName.trim()) {
      Alert.alert("Error", "Transaction name cannot be empty");
      return;
    }

    if (!editedCategory.trim()) {
      Alert.alert("Error", "Category cannot be empty");
      return;
    }

    // Check if name or category was changed from original
    const nameChanged = editedName !== transaction.name;
    const categoryChanged = editedCategory !== transaction.category;

    // If either was changed, prompt user for scope of changes
    if (nameChanged || categoryChanged) {
      Alert.alert(
        "Apply Changes",
        `You've changed ${nameChanged ? (categoryChanged ? "name and category" : "name") : "category"} for this transaction.`,
        [
          {
            text: "Only this transaction",
            onPress: () => {
              // Just update this transaction without saving mapping
              saveTransaction();
            }
          },
          {
            text: "All existing transactions",
            onPress: () => {
              // Update all existing transactions with this name
              updateAllExistingTransactions();
            }
          },
          {
            text: "All existing & future",
            onPress: () => {
              // Update all existing and save mapping for future
              updateAllExistingTransactions();
              saveTransactionMapping(transaction.name, editedName, editedCategory);
            }
          }
        ],
        { cancelable: false }
      );
    } else {
      // No changes in name/category, just save
      saveTransaction();
    }
  };

  // Helper function to update all existing transactions with the same name
  const updateAllExistingTransactions = () => {
    // Find all transactions with the same original name
    const originalName = transaction.name;
    let count = 0;
    
    // Update all matching transactions in the data array
    for (let i = 0; i < transactionData.length; i++) {
      if (transactionData[i].name === originalName) {
        transactionData[i].name = editedName;
        transactionData[i].category = editedCategory;
        count++;
      }
    }
    
    // Save the current transaction through the normal handler
    saveTransaction();
    
    // Notify user about the updates
    Alert.alert(
      "Transactions Updated",
      `Updated ${count} transaction${count !== 1 ? 's' : ''} with name "${originalName}".`
    );
  };

  // Check for mappings when component mounts
  useEffect(() => {
    const checkForMappings = async () => {
      if (transaction) {
        const { name, category, wasModified } = await applyTransactionMapping({
          name: transaction.name,
          category: transaction.category
        });

        // If there was a mapping found, update our state
        if (wasModified) {
          setEditedName(name);
          setEditedCategory(category);
          
          // Also update the original transaction in the data array
          if (transactionIndex !== -1) {
            const allTransactions = transactionData;
            allTransactions[transactionIndex].name = name;
            allTransactions[transactionIndex].category = category;
          }
        }
      }
    };

    checkForMappings();
  }, [transaction]);

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'groceries': return 'cart-outline';
      case 'rent': return 'home-outline';
      case 'bills': return 'receipt-outline';
      case 'transportation': return 'car-outline';
      case 'dining': return 'restaurant-outline';
      case 'shopping': return 'bag-outline';
      case 'healthcare': return 'medical-outline';
      case 'entertainment': return 'film-outline';
      default: return 'cube-outline';
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return "$" + amount.toFixed(2);
  };

  // If no transaction is found, show an error message
  if (!transaction) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Transaction not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <TouchableOpacity onPress={isEditing ? saveTransactionWithMapping : toggleEditMode}>
          <Ionicons name={isEditing ? "checkmark" : "pencil"} size={24} color="#3498db" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Amount Card */}
        <View style={[styles.amountCard, { backgroundColor: card?.color || "#3498db" }]}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amountValue}>{formatCurrency(transaction.mount)}</Text>
          {card && (
            <View style={styles.cardBadge}>
              <Ionicons name="card-outline" size={14} color="white" />
              <Text style={styles.cardBadgeText}>{card.name}</Text>
            </View>
          )}
        </View>

        {/* Details */}
        <View style={styles.detailsCard}>
          {/* Name */}
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Transaction name"
              />
            ) : (
              <Text style={styles.value}>{transaction.name}</Text>
            )}
          </View>

          <View style={styles.divider} />

          {/* Category */}
          <View style={styles.row}>
            <Text style={styles.label}>Category</Text>
            {isEditing ? (
              <TouchableOpacity 
                style={styles.categoryButton}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={styles.categoryText}>{editedCategory}</Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
            ) : (
              <Text style={styles.value}>{transaction.category}</Text>
            )}
          </View>

          <View style={styles.divider} />

          {/* Date */}
          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            {isEditing ? (
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>{editedDate.toLocaleDateString()}</Text>
                <Ionicons name="calendar-outline" size={16} color="#666" />
              </TouchableOpacity>
            ) : (
              <Text style={styles.value}>
                {new Date(transaction.date).toLocaleDateString()}
              </Text>
            )}
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={editedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}



        </View>

        {/* Similar Transactions */}
        <View style={styles.similarCard}>
          <Text style={styles.sectionTitle}>Similar Transactions</Text>
          
          {transactionData
            .filter(t => t.category === transaction.category && t.id !== transaction.id)
            .slice(0, 3)
            .map(similarTransaction => {
              const similarCard = similarTransaction.cardId ? 
                cardData.find(c => c.id === similarTransaction.cardId) : null;
                
              return (
                <View key={similarTransaction.id} style={styles.similarItem}>
                  <View style={styles.similarInfo}>
                    <Text style={styles.similarName}>{similarTransaction.name}</Text>
                    <Text style={styles.similarDate}>
                      {new Date(similarTransaction.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.similarAmount}>
                    {formatCurrency(similarTransaction.mount)}
                  </Text>
                </View>
              );
            })}
        </View>

        {/* Cancel Button */}
        {isEditing && (
          <TouchableOpacity style={styles.cancelButton} onPress={toggleEditMode}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Card Picker Modal */}
      {showCardPicker && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Card</Text>
              <TouchableOpacity onPress={() => setShowCardPicker(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {cardData.map((cardItem) => (
              <TouchableOpacity
                key={cardItem.id}
                style={styles.cardOption}
                onPress={() => handleCardSelect(cardItem.id)}
              >
                <View style={styles.cardInfo}>
                  <View style={[styles.dot, { backgroundColor: cardItem.color }]} />
                  <Text style={styles.cardName}>{cardItem.name}</Text>
                </View>
                {selectedCardId === cardItem.id && (
                  <Ionicons name="checkmark" size={20} color="#3498db" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      
      {/* Category Selection Modal - Updated to pass router */}
      <CategorySelectionModal
        visible={showCategoryModal}
        transaction={transaction}
        onClose={() => setShowCategoryModal(false)}
        onSelectCategory={handleCategorySelect}
        router={router}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",

  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 100,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  amountCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
  },
  cardBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  detailsCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 50,
  },
  label: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  value: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    flex: 1,
    marginLeft: 16,
    textAlign: "right",
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    flex: 1,
    marginLeft: 16,
    justifyContent: "space-between",
  },
  categoryText: {
    fontSize: 14,
    color: "#333",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    flex: 1,
    marginLeft: 16,
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: 14,
    color: "#333",
  },
  cardButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    flex: 1,
    marginLeft: 16,
    justifyContent: "space-between",
  },
  cardInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardName: {
    fontSize: 14,
    color: "#333",
    marginLeft: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 8,
  },
  similarCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  similarItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  similarInfo: {
    flex: 1,
  },
  similarName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  similarDate: {
    fontSize: 12,
    color: "#666",
  },
  similarAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2ecc71",
  },
  cancelButton: {
    backgroundColor: "#f1f3f4",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  cancelText: {
    color: "#e74c3c",
    fontWeight: "600",
  },
  // Modal
  modal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    width: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  cardOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  // Error
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#e74c3c",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    color: "white",
    fontWeight: "600",
  },
});