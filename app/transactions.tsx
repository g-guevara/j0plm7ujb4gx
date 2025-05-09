import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
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
} from "./data/sampleData";
import { styles } from "./styles/transactionStyles";

export default function TransactionsScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>(transactionData);
  const [cards, setCards] = useState<Card[]>(cardData);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCardName, setNewCardName] = useState("");
  const [newCardColor, setNewCardColor] = useState("#3498db");
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
      pathname: "/details",
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
      pathname: "/scan",
      params: { cardId: selectedCard.id.toString() }
    });
  };
  
  // Navigate to debug scan screen
  const handleDebugScanPress = () => {
    // Check if a card is selected before navigating to scan
    const selectedCard = cards.find(card => card.selected);
    if (!selectedCard) {
      Alert.alert("No Card Selected", "Please select a card before scanning receipts");
      return;
    }
    
    // Pass the selected card ID as a parameter
    router.push({
      pathname: "/4o-scan",
      params: { cardId: selectedCard.id.toString() }
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return "$" + amount.toFixed(2);
  };

  // Render each transaction item
  const renderItem = ({ item }: { item: Transaction }) => {
    // Find card associated with this transaction
    const card = item.cardId ? cards.find(c => c.id === item.cardId) : null;
    
    return (
      <TouchableOpacity
        style={styles.transactionCard}
        onPress={() => handleTransactionPress(item)}
      >
        {card && (
          <View 
            style={[styles.transactionCardIndicator, { backgroundColor: card.color }]} 
          />
        )}
        <View style={styles.leftContent}>
          <Text style={styles.transactionName}>{item.name}</Text>
          <Text style={styles.transactionCategory}>{item.category}</Text>
          <Text style={styles.transactionDate}>{item.date}</Text>
        </View>
        <View style={styles.rightContent}>
          <Text style={styles.transactionAmount}>
            {formatCurrency(item.mount)}
          </Text>
          {card && (
            <Text style={styles.cardNameLabel}>{card.name}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render each card item
  const renderCard = ({ item }: { item: Card }) => {
    return (
      <TouchableOpacity
        style={[
          styles.cardItem, 
          { borderColor: item.color },
          item.selected && styles.selectedCardItem
        ]}
        onPress={() => handleCardSelect(item.id)}
      >
        <View style={styles.cardContent}>
          <View style={[styles.cardIndicator, { backgroundColor: item.color }]} />
          <Text style={styles.cardName}>{item.name}</Text>
        </View>
        {item.selected && (
          <View style={styles.selectedCheckmark}>
            <Ionicons name="checkmark-circle" size={20} color={item.color} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Calculate total amount of all transactions
  const totalAmount = transactions.reduce((sum, item) => sum + item.mount, 0);

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
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Total Transactions</Text>
        <Text style={styles.summaryAmount}>{formatCurrency(totalAmount)}</Text>
        <Text style={styles.summaryCount}>{transactions.length} transactions</Text>
      </View>
      
      {/* Cards Section */}
      <View style={styles.cardsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Cards</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddCardModal(true)}
          >
            <Ionicons name="add-circle" size={24} color="#3498db" />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={cards}
          renderItem={renderCard}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsList}
        />
      </View>
      
      {/* Transactions List */}
      <View style={styles.transactionsSection}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <FlatList
          data={transactions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      </View>

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

      {/* Scan Button */}
      <TouchableOpacity 
        style={styles.scanButton}
        onPress={handleScanPress}
      >
        <Ionicons name="scan" size={24} color="white" />
      </TouchableOpacity>
      
      {/* Debug Button */}
      <TouchableOpacity 
        style={styles.debugButton}
        onPress={handleDebugScanPress}
      >
        <Ionicons name="bug" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}