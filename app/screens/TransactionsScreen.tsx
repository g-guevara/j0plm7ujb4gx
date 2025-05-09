import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  SectionList,
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

export default function TransactionsScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>(transactionData);
  const [cards, setCards] = useState<Card[]>(cardData);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCardName, setNewCardName] = useState("");
  const [newCardColor, setNewCardColor] = useState("#3498db");
  const [searchQuery, setSearchQuery] = useState("");
  const colorOptions = ["#3498db", "#2ecc71", "#e74c3c", "#f39c12", "#9b59b6", "#1abc9c", "#34495e", "#e67e22"];

  // Load all transactions (including scanned ones)
  useEffect(() => {
    // In a real implementation, we would load stored transactions here
    setTransactions(transactionData);
    setCards(cardData);
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

    // Filter transactions to show only those for the selected card
    const filteredTransactions = transactionData.filter(
      transaction => transaction.cardId === cardId
    );
    setTransactions(filteredTransactions);
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
    
    // Pass the selected card ID as a parameter
    router.push({
      pathname: "/screens/ScanScreen",
      params: { cardId: selectedCard.id.toString() }
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return "US$" + amount.toFixed(2);
  };

  // Group transactions by date
  const groupTransactionsByDate = () => {
    const groupedData: { title: string; data: Transaction[]; total: number }[] = [];
    const dateMap = new Map<string, { transactions: Transaction[], total: number }>();

    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Group by date
    sortedTransactions.forEach(transaction => {
      const date = transaction.date;
      const dateObj = new Date(date);
      
      // Format date as "Monday, 26 May" or similar
      const formattedDate = dateObj.toLocaleDateString('en-US', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
      
      if (!dateMap.has(formattedDate)) {
        dateMap.set(formattedDate, { transactions: [], total: 0 });
      }
      
      const group = dateMap.get(formattedDate)!;
      group.transactions.push(transaction);
      group.total += transaction.mount;
    });
    
    // Convert map to array for SectionList
    dateMap.forEach((value, key) => {
      groupedData.push({
        title: key,
        data: value.transactions,
        total: value.total
      });
    });
    
    return groupedData;
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
    // Find card associated with this transaction
    const card = item.cardId ? cards.find(c => c.id === item.cardId) : null;
    
    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => handleTransactionPress(item)}
      >
        <View style={styles.transactionIconContainer}>
          <View style={styles.transactionIcon}>
            <Ionicons 
              name={getCategoryIcon(item.category) as any} 
              size={16} 
              color="#FFFFFF" 
            />
          </View>
        </View>
        
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionName}>{item.name}</Text>
          {card && (
            <Text style={styles.transactionCategory}>{card.name}</Text>
          )}
        </View>
        
        <Text style={styles.transactionAmount}>
          {formatCurrency(item.mount)}
        </Text>
      </TouchableOpacity>
    );
  };

  // Get icon based on category - using type assertion to work with Ionicons
  const getCategoryIcon = (category: string) => {
    let iconName: any;
    
    switch (category.toLowerCase()) {
      case 'groceries':
        iconName = 'cart-outline';
        break;
      case 'entertainment':
        iconName = 'film-outline';
        break;
      case 'bills':
        iconName = 'receipt-outline';
        break;
      case 'transportation':
        iconName = 'car-outline';
        break;
      case 'dining':
        iconName = 'restaurant-outline';
        break;
      case 'shopping':
        iconName = 'bag-outline';
        break;
      case 'healthcare':
        iconName = 'medical-outline';
        break;
      default:
        iconName = 'cube-outline';
        break;
    }
    
    return iconName as any;
  };

  // Render section header (date and total)
  const renderSectionHeader = ({ section }: { section: { title: string; total: number } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
      <Text style={styles.sectionHeaderAmount}>{formatCurrency(section.total)}</Text>
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

  // Calculate total amount of all transactions
  const totalAmount = transactions.reduce((sum, item) => sum + item.mount, 0);

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
        sections={groupTransactionsByDate()}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
  },
  cardsSection: {
    marginVertical: 10,
  },
  cardsList: {
    paddingHorizontal: 15,
  },
  cardItem: {
    width: 150,
    height: 90,
    borderRadius: 10,
    marginRight: 10,
    padding: 15,
    justifyContent: "space-between",
  },
  cardName: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  cardAmount: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: "#000000",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: 14,
  },
  transactionsList: {
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#F8F8F8",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  sectionHeaderText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555555",
  },
  sectionHeaderAmount: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555555",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  transactionIconContainer: {
    marginRight: 12,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0A500",
    justifyContent: "center",
    alignItems: "center",
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 3,
  },
  transactionCategory: {
    fontSize: 14,
    color: "#888888",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
  },
  // Modal Styles
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  textInput: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  colorSelectorLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
    color: "#333",
  },
  colorSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColorOption: {
    borderColor: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: "#95a5a6",
  },
  saveButton: {
    backgroundColor: "#3498db",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});