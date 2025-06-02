import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { Card, getAllCategories } from "../../data/sampleData";
import { addNewTransaction } from "../../services/storage";

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  cards: Card[];
  onTransactionAdded: () => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  visible,
  onClose,
  cards,
  onTransactionAdded
}) => {
  const [transactionName, setTransactionName] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Others");
  const [selectedCardId, setSelectedCardId] = useState<number>(1);
  const [transactionDate, setTransactionDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showCardPicker, setShowCardPicker] = useState(false);
  const [isExpense, setIsExpense] = useState(true); // true for expense, false for income
  const [isLoading, setIsLoading] = useState(false);

  // Get categories from storage
  const categories = getAllCategories();

  // Get available cards (exclude "All" option)
  const availableCards = cards.filter(card => card.id !== 0);

  // Reset form when modal opens
  React.useEffect(() => {
    if (visible) {
      setTransactionName("");
      setAmount("");
      setSelectedCategory("Others");
      setTransactionDate(new Date());
      setIsExpense(true);
      
      // Set default card to the first available card or selected card
      const selectedCard = cards.find(card => card.selected && card.id !== 0);
      if (selectedCard) {
        setSelectedCardId(selectedCard.id);
      } else if (availableCards.length > 0) {
        setSelectedCardId(availableCards[0].id);
      }
    }
  }, [visible, cards]);

  const handleSaveTransaction = async () => {
    // Validation
    if (!transactionName.trim()) {
      Alert.alert("Error", "Please enter a transaction name");
      return;
    }

    if (!amount.trim() || isNaN(parseFloat(amount))) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (!selectedCardId) {
      Alert.alert("Error", "Please select a card");
      return;
    }

    setIsLoading(true);

    try {
      const numericAmount = parseFloat(amount);
      const finalAmount = isExpense ? Math.abs(numericAmount) : -Math.abs(numericAmount);

      const newTransaction = {
        name: transactionName.trim(),
        mount: finalAmount,
        category: selectedCategory,
        date: transactionDate.toISOString().split('T')[0],
        cardId: selectedCardId
      };

      await addNewTransaction(newTransaction);
      
      Alert.alert(
        "Success", 
        "Transaction added successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              onTransactionAdded();
              onClose();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error adding transaction:', error);
      Alert.alert("Error", "Failed to add transaction. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setTransactionDate(selectedDate);
    }
  };

  const formatCurrency = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    return cleanValue;
  };

  const getSelectedCard = () => {
    return availableCards.find(card => card.id === selectedCardId);
  };

  const getSelectedCategoryData = () => {
    return categories.find(cat => cat.name === selectedCategory);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Transaction</Text>
          <TouchableOpacity 
            onPress={handleSaveTransaction} 
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Transaction Type Toggle */}
          <View style={styles.typeToggleContainer}>
            <TouchableOpacity
              style={[styles.typeToggle, isExpense && styles.typeToggleActive]}
              onPress={() => setIsExpense(true)}
            >
              <Ionicons 
                name="remove-circle-outline" 
                size={20} 
                color={isExpense ? "white" : "#e74c3c"} 
              />
              <Text style={[styles.typeToggleText, isExpense && styles.typeToggleTextActive]}>
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeToggle, !isExpense && styles.typeToggleActive]}
              onPress={() => setIsExpense(false)}
            >
              <Ionicons 
                name="add-circle-outline" 
                size={20} 
                color={!isExpense ? "white" : "#2ecc71"} 
              />
              <Text style={[styles.typeToggleText, !isExpense && styles.typeToggleTextActive]}>
                Income
              </Text>
            </TouchableOpacity>
          </View>

          {/* Transaction Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Transaction Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter transaction name"
              value={transactionName}
              onChangeText={setTransactionName}
              maxLength={50}
            />
          </View>

          {/* Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                value={amount}
                onChangeText={(text) => setAmount(formatCurrency(text))}
                keyboardType="decimal-pad"
                maxLength={12}
              />
            </View>
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowCategoryPicker(true)}
            >
              <View style={styles.pickerContent}>
                {getSelectedCategoryData() && (
                  <View style={[styles.categoryIcon, { backgroundColor: getSelectedCategoryData()?.color }]}>
                    <Ionicons 
                      name={getSelectedCategoryData()?.icon as any} 
                      size={16} 
                      color="white" 
                    />
                  </View>
                )}
                <Text style={styles.pickerText}>{selectedCategory}</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Card */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Card</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowCardPicker(true)}
            >
              <View style={styles.pickerContent}>
                {getSelectedCard() && (
                  <View style={[styles.cardDot, { backgroundColor: getSelectedCard()?.color }]} />
                )}
                <Text style={styles.pickerText}>
                  {getSelectedCard()?.name || "Select a card"}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.pickerContent}>
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.pickerText}>
                  {transactionDate.toLocaleDateString()}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={transactionDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {/* Category Picker Modal */}
        <Modal
          visible={showCategoryPicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.pickerModalOverlay}>
            <View style={styles.pickerModalContent}>
              <View style={styles.pickerModalHeader}>
                <Text style={styles.pickerModalTitle}>Select Category</Text>
                <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={categories}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.categoryPickerItem,
                      selectedCategory === item.name && styles.selectedPickerItem
                    ]}
                    onPress={() => {
                      setSelectedCategory(item.name);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
                      <Ionicons name={item.icon as any} size={20} color="white" />
                    </View>
                    <Text style={styles.categoryPickerText}>{item.name}</Text>
                    {selectedCategory === item.name && (
                      <Ionicons name="checkmark" size={20} color="#3498db" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Card Picker Modal */}
        <Modal
          visible={showCardPicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.pickerModalOverlay}>
            <View style={styles.pickerModalContent}>
              <View style={styles.pickerModalHeader}>
                <Text style={styles.pickerModalTitle}>Select Card</Text>
                <TouchableOpacity onPress={() => setShowCardPicker(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={availableCards}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.cardPickerItem,
                      selectedCardId === item.id && styles.selectedPickerItem
                    ]}
                    onPress={() => {
                      setSelectedCardId(item.id);
                      setShowCardPicker(false);
                    }}
                  >
                    <View style={[styles.cardDot, { backgroundColor: item.color }]} />
                    <Text style={styles.cardPickerText}>{item.name}</Text>
                    {selectedCardId === item.id && (
                      <Ionicons name="checkmark" size={20} color="#3498db" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#95a5a6",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  typeToggleContainer: {
    flexDirection: "row",
    backgroundColor: "#e9ecef",
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  typeToggle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 6,
  },
  typeToggleActive: {
    backgroundColor: "#3498db",
  },
  typeToggleText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
    color: "#666",
  },
  typeToggleTextActive: {
    color: "white",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 8,
    paddingLeft: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    padding: 12,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 8,
    padding: 12,
  },
  pickerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  pickerText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 8,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  // Picker Modal Styles
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  pickerModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: "70%",
  },
  pickerModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  categoryPickerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  categoryPickerText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
  cardPickerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  cardPickerText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
  selectedPickerItem: {
    backgroundColor: "#f8f9fa",
  },
});

export default AddTransactionModal;