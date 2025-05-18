import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  SectionList,
  StatusBar,
  StyleSheet,
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

import { styles as transactionStyles } from "../styles/transactionStyles";

// Create our own styles that won't conflict with transactionStyles
const localStyles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    width: '100%',
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'transparent', // Make container transparent instead of white
    zIndex: 2,
  }
});

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
          transactionStyles.cardItem, 
          { backgroundColor: isSelected ? item.color : '#e0e0e0' },
        ]}
        onPress={() => handleCardSelect(item.id)}
      >
        <Text style={transactionStyles.cardName}>{item.name}</Text>
        
        {isSelected && (
          <Text style={transactionStyles.cardAmount}>$23,00</Text>
        )}
      </TouchableOpacity>
    );
  };

  // Render each transaction item
  const renderTransaction = ({ item }: { item: Transaction }) => {
    return (
      <TouchableOpacity
        style={transactionStyles.transactionItem}
        onPress={() => handleTransactionPress(item)}
      >
        <View style={transactionStyles.transactionIconContainer}>
          {renderTransactionIcon(item.category)}
        </View>
        
        <View style={transactionStyles.transactionDetails}>
          <Text style={transactionStyles.transactionName}>{item.name}</Text>
          <Text style={transactionStyles.transactionCategory}>{item.category}</Text>
        </View>
        
        <Text style={transactionStyles.transactionAmount}>
          {formatCurrency(item.mount)}
        </Text>
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
        {section.total < 0 ? `-US${Math.abs(section.total).toFixed(0)}` : `-US${section.total.toFixed(0)}`}
      </Text>
    </View>
  );

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
    <View style={{ flex: 1 }}>
      {/* Background image - using dashboard-bg.png now */}
      <Image
        source={require('../../assets/images/dashboard-bg.png')}
        style={localStyles.background}
        resizeMode="cover"
      />
      
      {/* The rest of the UI with transparent container */}
      <View style={localStyles.contentContainer}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header / Title */}
        <View style={transactionStyles.headerContainer}>
          <Text style={transactionStyles.headerTitle}>Wallet</Text>
          <TouchableOpacity 
            style={transactionStyles.editCardsButton}
            onPress={() => router.push("/screens/CardEditScreen")}
          >
            <Text style={transactionStyles.editCardsButtonText}>Edit Cards</Text>
          </TouchableOpacity>
        </View>

        {/* Cards Section */}
        <View style={transactionStyles.cardsSection}>
          <FlatList
            data={cards}
            renderItem={renderCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={transactionStyles.cardsList}
          />
        </View>
        
        {/* Search Bar */}
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
            onPress={handleScanPress}
          >
            <Text style={transactionStyles.addButtonText}>+ Add file</Text>
          </TouchableOpacity>
        </View>
        
        {/* Transactions List */}
        <SectionList
          sections={groupTransactionsByDate(transactions)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTransaction}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled={true}
          contentContainerStyle={transactionStyles.transactionsList}
        />

        {/* Add Card Modal */}
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
      </View>
    </View>
  );
}