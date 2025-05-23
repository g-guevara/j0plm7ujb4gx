import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { cardData, transactionData } from "../data/sampleData";
import { styles } from "../styles/DetailStyles";

import { DetailsComponents } from "../components/DetailComponents";
import { DetailsHandlers } from "../components/DetailHandlers";
import CategorySelectionModal from "../components/transactions/CategorySelectionModal";
import { applyTransactionMapping, saveTransactionMapping } from "../utils/transactionMapping";

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
  
  // State for category selection modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Find the card associated with this transaction
  const card = cardData.find(c => c.id === (isEditing ? selectedCardId : transaction?.cardId));

  // Set up handlers
  const handlers = DetailsHandlers({
    transaction,
    transactionIndex,
    isEditing, 
    setIsEditing,
    editedName,
    setEditedName, 
    editedCategory, 
    setEditedCategory,
    editedDate,
    setEditedDate,
    showDatePicker, 
    setShowDatePicker,
    showCardPicker, 
    setShowCardPicker,
    selectedCardId, 
    setSelectedCardId
  });

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
              handlers.saveTransaction();
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
      handlers.saveTransaction();
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
    handlers.saveTransaction();
    
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

  // If no transaction is found, show an error message
  if (!transaction) {
    return (
      <View style={styles.container}>
        <DetailsComponents.ErrorMessage message="Transaction not found" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Section Title with Edit Button */}
      <DetailsComponents.TitleHeader 
        isEditing={isEditing}
        onEdit={handlers.toggleEditMode}
        onSave={saveTransactionWithMapping}
      />

      {/* Transaction Amount Card */}
      <DetailsComponents.AmountCard 
        amount={transaction.mount}
        card={card}
      />

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
              <TouchableOpacity 
                style={styles.categorySelector}
                onPress={() => setShowCategoryModal(true)}
              >
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{editedCategory}</Text>
                </View>
                <Ionicons name="chevron-down" size={16} color="#333" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
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
              <Text style={styles.detailValue}>
                {new Date(transaction.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            )}
          </View>
          
          {/* Show date picker when needed */}
          {showDatePicker && (
            <DateTimePicker
              value={editedDate}
              mode="date"
              display="default"
              onChange={handlers.handleDateChange}
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

      {/* Similar Transactions */}
      <DetailsComponents.SimilarTransactions 
        category={transaction.category}
        currentId={transaction.id}
      />

      {/* Card Picker Modal */}
      <DetailsComponents.CardPickerModal
        visible={showCardPicker}
        selectedCardId={selectedCardId}
        onCardSelect={handlers.handleCardSelect}
        onClose={() => setShowCardPicker(false)}
      />
      
      {/* Category Selection Modal */}
      <CategorySelectionModal
        visible={showCategoryModal}
        transaction={transaction}
        onClose={() => setShowCategoryModal(false)}
        onSelectCategory={(category) => handleCategorySelect(category)}
      />
    </ScrollView>
  );
}