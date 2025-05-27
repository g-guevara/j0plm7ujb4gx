import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Modal,
  SectionList,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Card, Transaction } from "../../data/sampleData";
import { styles as transactionStyles } from "../../styles/transactionStyles";


import SwipeableTransaction from "../SwipableTransaction";


import {
  groupTransactionsByDate,
  renderTransactionIcon
} from "./transactionHelpers";

// Render each card item
const renderCard = ({ item, onCardSelect }: { item: Card, onCardSelect: (id: number) => void }) => {
  const isSelected = item.selected;
  
  return (
    <TouchableOpacity
      style={[
        transactionStyles.cardItem, 
        { backgroundColor: isSelected ? item.color : '#e0e0e0' },
      ]}
      onPress={() => onCardSelect(item.id)}
    >
      <Text style={transactionStyles.cardName}>{item.name}</Text>
      
      {isSelected && (
        <Text style={transactionStyles.cardAmount}>$23,00</Text>
      )}
    </TouchableOpacity>
  );
};

// Render section header (date and total)
const renderSectionHeader = ({ section }: { section: { title: string; total: number } }) => (
  <View style={transactionStyles.sectionHeader}>
    <Text style={transactionStyles.sectionHeaderText}>{section.title}</Text>
    <View style={transactionStyles.dotContainer}>
      <Text style={transactionStyles.dotSeparator}>{"............................................"}</Text>
    </View>
    <Text style={transactionStyles.sectionHeaderAmount}>
      {section.total < 0 ? `-${Math.abs(section.total).toFixed(0)}` : `-${section.total.toFixed(0)}`}
    </Text>
  </View>
);

// Cards Section Component
const CardsSection = ({ 
  cards, 
  onCardSelect 
}: { 
  cards: Card[], 
  onCardSelect: (id: number) => void 
}) => (
  <View style={transactionStyles.cardsSection}>
    <FlatList
      data={cards}
      renderItem={({ item }) => renderCard({ item, onCardSelect })}
      keyExtractor={(item) => item.id.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={transactionStyles.cardsList}
    />
  </View>
);

// Search Bar Component
const SearchBar = ({ 
  searchQuery, 
  setSearchQuery, 
  onScanPress 
}: { 
  searchQuery: string, 
  setSearchQuery: (query: string) => void, 
  onScanPress: () => void 
}) => (
  <View style={transactionStyles.searchContainer}>
    <View style={transactionStyles.searchBar}>
      <Ionicons name="search" size={20} color="#999" style={transactionStyles.searchIcon} />
      <TextInput
        style={transactionStyles.searchInput}
        placeholder="Search"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
    </View>
    <TouchableOpacity 
      style={transactionStyles.addButton}
      onPress={onScanPress}
    >
      <Text style={transactionStyles.addButtonText}>+ Add file</Text>
    </TouchableOpacity>
  </View>
);

// Transactions List Component
const TransactionsList = ({ 
  transactions, 
  onTransactionPress,
  onTransactionIconPress,
  onDeleteTransaction
}: { 
  transactions: Transaction[], 
  onTransactionPress: (transaction: Transaction) => void,
  onTransactionIconPress: (transaction: Transaction) => void,
  onDeleteTransaction: (transactionId: number) => void
}) => (
  <SectionList
    sections={groupTransactionsByDate(transactions)}
    keyExtractor={(item) => item.id.toString()}
    renderItem={({ item }) => (
      <SwipeableTransaction
        item={item}
        onPress={onTransactionPress}
        onIconPress={onTransactionIconPress}
        onDelete={onDeleteTransaction}
        renderTransactionIcon={renderTransactionIcon}
      />
    )}
    renderSectionHeader={renderSectionHeader}
    stickySectionHeadersEnabled={true}
    contentContainerStyle={transactionStyles.transactionsList}
  />
);

// Add Card Modal Component
const AddCardModal = ({ 
  showAddCardModal, 
  newCardName, 
  newCardColor, 
  setNewCardName, 
  setNewCardColor, 
  setShowAddCardModal, 
  handleAddCard 
}: { 
  showAddCardModal: boolean, 
  newCardName: string, 
  newCardColor: string, 
  setNewCardName: (name: string) => void, 
  setNewCardColor: (color: string) => void, 
  setShowAddCardModal: (show: boolean) => void, 
  handleAddCard: () => void 
}) => {
  const colorOptions = ["#3498db", "#2ecc71", "#e74c3c", "#f39c12", "#9b59b6", "#1abc9c", "#34495e", "#e67e22"];

  // Render color option for card creation
  const renderColorOption = (color: string) => (
    <TouchableOpacity
      key={color}
      style={[
        transactionStyles.colorOption,
        { backgroundColor: color },
        newCardColor === color && transactionStyles.selectedColorOption
      ]}
      onPress={() => setNewCardColor(color)}
    />
  );

  return (
    <Modal
      visible={showAddCardModal}
      transparent={true}
      animationType="slide"
    >
      <View style={transactionStyles.modalOverlay}>
        <View style={transactionStyles.modalContent}>
          <Text style={transactionStyles.modalTitle}>Add New Card</Text>
          
          <TextInput
            style={transactionStyles.textInput}
            placeholder="Card Name"
            value={newCardName}
            onChangeText={setNewCardName}
            maxLength={20}
          />
          
          <Text style={transactionStyles.colorSelectorLabel}>Select Card Color</Text>
          <View style={transactionStyles.colorSelector}>
            {colorOptions.map(renderColorOption)}
          </View>
          
          <View style={transactionStyles.modalButtons}>
            <TouchableOpacity 
              style={[transactionStyles.modalButton, transactionStyles.cancelButton]}
              onPress={() => {
                setShowAddCardModal(false);
                setNewCardName("");
              }}
            >
              <Text style={transactionStyles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[transactionStyles.modalButton, transactionStyles.saveButton]}
              onPress={handleAddCard}
            >
              <Text style={transactionStyles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const TransactionComponents = {
  CardsSection,
  SearchBar,
  TransactionsList,
  AddCardModal
};