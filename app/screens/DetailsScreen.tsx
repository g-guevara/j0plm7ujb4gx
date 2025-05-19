import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  View
} from "react-native";
import { cardData, transactionData } from "../data/sampleData";
import { styles } from "../styles/DetailStyles";


import { DetailsComponents } from "../components/DetailComponents";

import { DetailsHandlers } from "../components/DetailHandlers";

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
        onSave={handlers.saveTransaction}
      />

      {/* Transaction Amount Card */}
      <DetailsComponents.AmountCard 
        amount={transaction.mount}
        card={card}
      />

      {/* Transaction Details */}
      <View style={styles.section}>
        <DetailsComponents.DetailsCard 
          transaction={transaction}
          isEditing={isEditing}
          editedName={editedName}
          editedCategory={editedCategory}
          editedDate={editedDate}
          card={card}
          showDatePicker={showDatePicker}
          setEditedName={setEditedName}
          setEditedCategory={setEditedCategory}
          onDatePress={() => setShowDatePicker(true)}
          onDateChange={handlers.handleDateChange}
          onCardPress={() => setShowCardPicker(true)}
        />
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
    </ScrollView>
  );
}