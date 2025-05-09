import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  SectionList,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import {
  addCard,
  Card,
  cardData,
  selectCard,
  Transaction,
  transactionData
} from "../data/sampleData";

import {
  formatCurrency,
  groupTransactionsByDate,
  renderTransactionIcon
} from "../components/transactions/transactionHelpers";

import { styles } from "../styles/transactionStyles";

export default function TransactionsScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>(transactionData);
  const [cards, setCards] = useState<Card[]>(cardData);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCardName, setNewCardName] = useState("");
  const [newCardColor, setNewCardColor] = useState("#3498db");
  const [searchQuery, setSearchQuery] = useState("");
  const colorOptions = ["#3498db", "#2ecc71", "#e74c3c", "#f39c12", "#9b59b6", "#1abc9c", "#34495e", "#e67e22"];

  // Add "All" card option
  const allCardsOption: Card = {
    id: 0,
    name: "All",
    color: "#555555",
    selected: true
  };

  // Load all transactions (including scanned ones)
  useEffect(() => {
    // In a real implementation, we would load stored transactions here
    setTransactions(transactionData);
    
    // Add "All" card option to the beginning of the cards array
    const updatedCards = [allCardsOption, ...cardData.map(card => ({
      ...card,
      selected: false
    }))];
    
    setCards(updatedCards);
  }, []);

  // Navigate to details screen with transaction data
  const handleTransactionPress = (transaction: Transaction) => {
    router.push({
      pathname: "/screens/DetailsScreen",
      params: { transactionId: transaction.id.toString() }
    });
  };

  // Handle card selection
  const handleCardSelect = (cardId: number) => {
    selectCard(cardId);
    // Update state to reflect changes
    const updatedCards = cards.map(card => ({
      ...card,
      selected: card.id === cardId
    }));
    setCards(updatedCards);

    // Check if "All" card (id 0) is selected
    if (cardId === 0) {
      // Show all transactions
      setTransactions(transactionData);
    } else {
      // Filter transactions to show only those for the selected card
      const filteredTransactions = transactionData.filter(
        transaction => transaction.cardId === cardId
      );
      setTransactions(filteredTransactions);
    }
  };

  // Handle creating a new card
  const handleAddCard = () => {
    if (!newCardName.trim()) {
      Alert.alert("Error", "Please enter a card name");
      return;
    }

    const newCardObj = addCard(newCardName, newCardColor);
    setCards([...cards, newCardObj]);
    setShowAddCardModal(false);
    setNewCardName("");
  };

  // Navigate to scan screen
  const handleScanPress = () => {
    // Check if a card is selected before navigating to scan
    const selectedCard = cards.find(card => card.selected);
    if (!selectedCard) {
      Alert.alert("No Card Selected", "Please select a card before scanning receipts");
      return;
    }
    
    // If "All" is selected, ask the user to select a specific card
    if (selectedCard.id === 0) {
      Alert.alert("Select a Specific Card", "Please select a specific card before scanning receipts");
      return;
    }
    
    // Pass the selected card ID as a parameter
    router.push({
      pathname: "/screens/ScanScreen",
      params: { cardId: selectedCard.id.toString() }
    });
  };

  // Render each card item
  const renderCard = ({ item }: { item: Card }) => {
    const isSelected = item.selected;
    
    return (
      <TouchableOpacity
        style={[
          styles.cardItem, 
          { backgroundColor: isSelected ? item.color : '#e0e0e0' },
        ]}
        onPress={() => handleCardSelect(item.id)}
      >
        <Text style={styles.cardName}>{item.name}</Text>
        
        {isSelected && (
          <Text style={styles.cardAmount}>$23,00</Text>
        )}
      </TouchableOpacity>
    );
  };

  // Render each transaction item
  const renderTransaction = ({ item }: { item: Transaction }) => {
    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => handleTransactionPress(item)}
      >
        <View style={styles.transactionIconContainer}>
          {renderTransactionIcon(item.category)}
        </View>
        
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionName}>{item.name}</Text>
          <Text style={styles.transactionCategory}>{item.category}</Text>
        </View>
        
        <Text style={styles.transactionAmount}>
          {formatCurrency(item.mount)}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render section header (date and total)
// Render section header (date and total)
const renderSectionHeader = ({ section }: { section: { title: string; total: number } }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderText}>{section.title}</Text>
    <View style={styles.dotContainer}>
      <Text style={styles.dotSeparator}>{"............................................"}</Text>
    </View>
    <Text style={styles.sectionHeaderAmount}>
      {section.total < 0 ? `-US$${Math.abs(section.total).toFixed(0)}` : `-US$${section.total.toFixed(0)}`}
    </Text>
  </View>
);

  // Render color option for card creation
  const renderColorOption = (color: string) => (
    <TouchableOpacity
      key={color}
      style={[
        styles.colorOption,
        { backgroundColor: color },
        newCardColor === color && styles.selectedColorOption
      ]}
      onPress={() => setNewCardColor(color)}
    />
  );

  return (
    <View style={styles.container}>
      {/* Header / Title */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Wallet</Text>
      </View>

      {/* Cards Section */}
      <View style={styles.cardsSection}>
        <FlatList
          data={cards}
          renderItem={renderCard}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsList}
        />
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleScanPress}
        >
          <Text style={styles.addButtonText}>+ Add file</Text>
        </TouchableOpacity>
      </View>
      
      {/* Transactions List */}
      <SectionList
        sections={groupTransactionsByDate(transactions)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTransaction}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={true}
        contentContainerStyle={styles.transactionsList}
      />

      {/* Add Card Modal */}
      <Modal
        visible={showAddCardModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Card</Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Card Name"
              value={newCardName}
              onChangeText={setNewCardName}
              maxLength={20}
            />
            
            <Text style={styles.colorSelectorLabel}>Select Card Color</Text>
            <View style={styles.colorSelector}>
              {colorOptions.map(renderColorOption)}
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddCardModal(false);
                  setNewCardName("");
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddCard}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}