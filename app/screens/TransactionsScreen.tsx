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
import { Card, cardData, Transaction, transactionData } from "../data/sampleData";
import { styles as transactionStyles } from "../styles/transactionStyles";

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

  // Add "All" card option
  const allCardsOption: Card = {
    id: 0,
    name: "All",
    color: "#555555",
    selected: true
  };

  // Handle transaction icon press to open category selection modal
  const handleTransactionIconPress = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowCategoryModal(true);
  };

  // Handle category selection
  const handleCategorySelect = (category: string, transactionId: number) => {
    // Find and update the transaction with the new category
    const updatedTransactions = transactions.map(transaction => 
      transaction.id === transactionId 
        ? { ...transaction, category: category }
        : transaction
    );
    
    // Update the transactions data
    setTransactions(updatedTransactions);
    
    // Also update the original data source
    const index = transactionData.findIndex(t => t.id === transactionId);
    if (index !== -1) {
      transactionData[index].category = category;
    }
    
    // Close the modal
    setShowCategoryModal(false);
    setSelectedTransaction(null);
    
    // Show confirmation
    Alert.alert("Category Updated", `Transaction category updated to ${category}`);
  };

  // Handle transaction deletion
  const handleDeleteTransaction = (transactionId: number) => {
    // Remove from the state array
    const updatedTransactions = transactions.filter(
      transaction => transaction.id !== transactionId
    );
    setTransactions(updatedTransactions);
    
    // Remove from the original data source
    const index = transactionData.findIndex(t => t.id === transactionId);
    if (index !== -1) {
      transactionData.splice(index, 1);
    }
    
    // Show success message
    Alert.alert("Transaction Deleted", "The transaction has been deleted successfully.");
  };

  // Load all transactions and cards when the screen gains focus
  useFocusEffect(
    useCallback(() => {
      console.log("Wallet screen focused - reloading cards data");
      
      // IMPORTANT: Always reload transactions from the source
      setTransactions([...transactionData]);
      
      // Add "All" card option to the beginning of the cards array
      const updatedCards = [allCardsOption, ...cardData.map(card => ({
        ...card,
        selected: card.id === 0 // Only "All" is selected by default
      }))];
      
      setCards(updatedCards);
      
      console.log(`Loaded ${cardData.length} cards from cardData`);
      console.log(`Loaded ${transactionData.length} transactions from transactionData`);
      
    }, []) // Dependencies array should be empty to run every time the screen is focused
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

        {/* Cards, Search Bar and Transactions List */}
        <TransactionComponents.CardsSection 
          cards={cards} 
          onCardSelect={handlers.handleCardSelect} 
        />
        
        <TransactionComponents.SearchBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onScanPress={handlers.handleScanPress}
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
      </View>
    </View>
  );
}