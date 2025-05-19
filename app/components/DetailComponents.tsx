import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import React from "react";
import {
    FlatList,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { Card, cardData, Transaction, transactionData } from "../data/sampleData";
import { styles } from "../styles/DetailStyles";

// Format currency for display
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

// Title Header Component
const TitleHeader = ({ 
  isEditing, 
  onEdit, 
  onSave 
}: { 
  isEditing: boolean; 
  onEdit: () => void; 
  onSave: () => void; 
}) => (
  <View style={styles.titleContainer}>
    <Text style={styles.sectionTitle}>Transaction Details</Text>
    
    <TouchableOpacity 
      style={styles.editButton}
      onPress={isEditing ? onSave : onEdit}
    >
      <Text style={styles.editButtonText}>
        {isEditing ? "Save" : "Edit"}
      </Text>
    </TouchableOpacity>
    
    {isEditing && (
      <TouchableOpacity 
        style={styles.cancelButton}
        onPress={onEdit}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    )}
  </View>
);

// Amount Card Component
const AmountCard = ({ 
  amount, 
  card 
}: { 
  amount: number; 
  card?: Card; 
}) => (
  <View style={[styles.amountCard, card ? {backgroundColor: card.color} : {}]}>
    <Text style={styles.amountLabel}>Amount</Text>
    <Text style={styles.amountValue}>{formatCurrency(amount)}</Text>
    {card && (
      <View style={styles.cardBadge}>
        <Text style={styles.cardBadgeText}>{card.name}</Text>
      </View>
    )}
  </View>
);

// Card Picker Modal Component
const CardPickerModal = ({ 
  visible, 
  selectedCardId, 
  onCardSelect, 
  onClose 
}: { 
  visible: boolean; 
  selectedCardId: number; 
  onCardSelect: (id: number) => void; 
  onClose: () => void; 
}) => {
  // Render card item
  const renderCardItem = ({ item }: { item: Card }) => (
    <TouchableOpacity 
      style={[
        styles.cardItem, 
        { backgroundColor: item.color },
        item.id === selectedCardId && styles.selectedCardItem
      ]}
      onPress={() => onCardSelect(item.id)}
    >
      <Text style={styles.cardItemName}>{item.name}</Text>
      {item.id === selectedCardId && (
        <View style={styles.selectedCardCheck}>
          <Ionicons name="checkmark-circle" size={20} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
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
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Error Message Component
const ErrorMessage = ({ message }: { message: string }) => (
  <Text style={styles.errorText}>{message}</Text>
);

// Export as a single object
export const DetailsComponents = {
  TitleHeader,
  AmountCard,
  DetailsCard,
  SimilarTransactions,
  CardPickerModal,
  ErrorMessage
};

// Details Card Component
function DetailsCard({ 
  transaction, 
  isEditing, 
  editedName, 
  editedCategory, 
  editedDate,
  card,
  showDatePicker,
  setEditedName,
  setEditedCategory, 
  onDatePress,
  onDateChange,
  onCardPress
}: { 
  transaction: Transaction; 
  isEditing: boolean; 
  editedName: string; 
  editedCategory: string; 
  editedDate: Date;
  card?: Card;
  showDatePicker: boolean;
  setEditedName: (name: string) => void;
  setEditedCategory: (category: string) => void;
  onDatePress: () => void;
  onDateChange: (event: any, date?: Date) => void;
  onCardPress: () => void;
}) {
  return (
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
            onPress={onDatePress}
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
                onPress={onCardPress}
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
  );
}

// Similar Transactions Component
function SimilarTransactions({ 
  category, 
  currentId 
}: { 
  category: string; 
  currentId: number;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Similar Transactions</Text>
      {transactionData
        .filter(t => t.category === category && t.id !== currentId)
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
  );
}