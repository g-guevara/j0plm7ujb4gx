import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Card, Transaction } from "../data/sampleData";
import { styles as transactionStyles } from "../styles/transactionStyles";

// Import storage functions
import {
  deleteTransaction as deleteTransactionFromStorage,
  getAllCards,
  getAllTransactions,
  updateTransaction
} from "../services/storage";

import { Ionicons } from "@expo/vector-icons";
import AddTransactionModal from "../components/transactions/AddTransactionModal";
import CategorySelectionModal from "../components/transactions/CategorySelectionModal";
import { TransactionComponents } from "../components/transactions/TransactionComponents";
import { TransactionHandlers } from "../components/transactions/TransactionHandlers";

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
  },
  // Empty state styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 100,
  },
  emptyStateIcon: {
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addFirstCardButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addFirstCardButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default function TransactionsScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [newCardName, setNewCardName] = useState("");
  const [newCardColor, setNewCardColor] = useState("#3498db");
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for category selection modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  const handlers = TransactionHandlers({
    cards,
    setCards,
    transactions,
    setTransactions,
    showAddCardModal,
    setShowAddCardModal,
    newCardName,
    setNewCardName,
    newCardColor,
    setNewCardColor,
    router
  });

  // Function to load data from storage
  const loadDataFromStorage = useCallback(() => {
    console.log("Loading data from storage...");
    
    try {
      // Load transactions from storage
      const storedTransactions = getAllTransactions();
      setTransactions([...storedTransactions]);
      console.log(`Loaded ${storedTransactions.length} transactions from storage`);
      
      // Load cards from storage
      const storedCards = getAllCards();
      
      if (storedCards.length === 0) {
        // No cards exist - show empty state
        setCards([]);
        console.log("No cards found - showing empty state");
      } else {
        // Add "All" card option to the beginning of the cards array only if we have real cards
        const allCardsOption: Card = {
          id: 0,
          name: "All",
          color: "#555555",
          selected: true // Default to "All" selected
        };
        
        // Check if any card is actually selected, otherwise default to "All"
        const hasSelectedCard = storedCards.some(card => card.selected);
        const updatedCards = [
          { ...allCardsOption, selected: !hasSelectedCard },
          ...storedCards.map(card => ({
            ...card,
            selected: hasSelectedCard ? card.selected : false
          }))
        ];
        
        setCards(updatedCards);
        console.log(`Loaded ${storedCards.length} cards from storage (plus "All" option)`);
      }
      
    } catch (error) {
      console.error("Error loading data from storage:", error);
      Alert.alert("Error", "Failed to load data. Please restart the app.");
    }
  }, []);

  // Handle transaction icon press to open category selection modal
  const handleTransactionIconPress = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowCategoryModal(true);
  };

  // Handle category selection
  const handleCategorySelect = async (category: string, transactionId: number) => {
    try {
      // Find the transaction in our local state
      const updatedTransactions = transactions.map(transaction => 
        transaction.id === transactionId 
          ? { ...transaction, category: category }
          : transaction
      );
      
      // Update local state
      setTransactions(updatedTransactions);
      
      // Find the transaction to update
      const transactionToUpdate = updatedTransactions.find(t => t.id === transactionId);
      
      if (transactionToUpdate) {
        // Update in storage using the storage service
        const success = await updateTransaction(transactionToUpdate);
        
        if (success) {
          // Close the modal
          setShowCategoryModal(false);
          setSelectedTransaction(null);
          
          // Show confirmation
          Alert.alert("Category Updated", `Transaction category updated to ${category}`);
        } else {
          throw new Error("Failed to update transaction in storage");
        }
      }
    } catch (error) {
      console.error("Error updating transaction category:", error);
      Alert.alert("Error", "Failed to update transaction category. Please try again.");
      
      // Reload data to ensure consistency
      loadDataFromStorage();
    }
  };

  // Handle transaction deletion
  const handleDeleteTransaction = async (transactionId: number) => {
    try {
      // Delete from storage first
      const success = await deleteTransactionFromStorage(transactionId);
      
      if (success) {
        // Remove from local state
        const updatedTransactions = transactions.filter(
          transaction => transaction.id !== transactionId
        );
        setTransactions(updatedTransactions);
        
        // Show success message
      } else {
        throw new Error("Failed to delete transaction from storage");
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      Alert.alert("Error", "Failed to delete transaction. Please try again.");
      
      // Reload data to ensure consistency
      loadDataFromStorage();
    }
  };

  // Handle manual transaction addition
  const handleAddManually = () => {
    // Check if a card is selected before allowing manual entry
    const selectedCard = cards.find(card => card.selected);
    if (!selectedCard) {
      Alert.alert("No Card Selected", "Please select a card before adding a transaction");
      return;
    }
    
    // If "All" is selected, ask the user to select a specific card
    if (selectedCard.id === 0) {
      Alert.alert("Select a Specific Card", "Please select a specific card before adding a transaction");
      return;
    }
    
    // Open the add transaction modal
    setShowAddTransactionModal(true);
  };

  // Handle transaction added callback
  const handleTransactionAdded = () => {
    // Reload data from storage to show the new transaction
    loadDataFromStorage();
  };

  // Handle adding first card
  const handleAddFirstCard = () => {
    router.push("/screens/CardEditScreen");
  };

  // Load all transactions and cards when the screen gains focus
  useFocusEffect(
    useCallback(() => {
      console.log("Wallet screen focused - reloading data from storage");
      loadDataFromStorage();
    }, [loadDataFromStorage])
  );

  // Render empty state when no cards exist
  if (cards.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        {/* Background image */}
        <Image
          source={require('../../assets/images/dashboard-bg.png')}
          style={localStyles.background}
          resizeMode="cover"
        />
        
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

          {/* Empty State */}
          <View style={localStyles.emptyStateContainer}>
            <View style={localStyles.emptyStateIcon}>
              <Ionicons name="card-outline" size={80} color="#ccc" />
            </View>
            
            <Text style={localStyles.emptyStateTitle}>No Cards Yet</Text>
            
            <Text style={localStyles.emptyStateDescription}>
              Create your first card to start tracking your expenses and managing your finances.
            </Text>
            
            <TouchableOpacity 
              style={localStyles.addFirstCardButton}
              onPress={handleAddFirstCard}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={localStyles.addFirstCardButtonText}>Add Your First Card</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Normal render when cards exist
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

        {/* Cards, Search Bar and Transactions List */}
        <TransactionComponents.CardsSection 
          cards={cards} 
          onCardSelect={handlers.handleCardSelect} 
        />
        
        <TransactionComponents.SearchBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddManually={handleAddManually}
          onScanFiles={handlers.handleScanFiles}
        />
        
        <TransactionComponents.TransactionsList 
          transactions={transactions}
          onTransactionPress={handlers.handleTransactionPress}
          onTransactionIconPress={handleTransactionIconPress}
          onDeleteTransaction={handleDeleteTransaction}
        />

        {/* Add Card Modal */}
        <TransactionComponents.AddCardModal 
          showAddCardModal={showAddCardModal}
          newCardName={newCardName}
          newCardColor={newCardColor}
          setNewCardName={setNewCardName}
          setNewCardColor={setNewCardColor}
          setShowAddCardModal={setShowAddCardModal}
          handleAddCard={handlers.handleAddCard}
        />
        
        {/* Category Selection Modal */}
        <CategorySelectionModal
          visible={showCategoryModal}
          transaction={selectedTransaction}
          onClose={() => {
            setShowCategoryModal(false);
            setSelectedTransaction(null);
          }}
          onSelectCategory={handleCategorySelect}
        />

        {/* Add Transaction Modal */}
        <AddTransactionModal
          visible={showAddTransactionModal}
          onClose={() => setShowAddTransactionModal(false)}
          cards={cards}
          onTransactionAdded={handleTransactionAdded}
        />
      </View>
    </View>
  );
}