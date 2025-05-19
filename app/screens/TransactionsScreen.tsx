import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Card, cardData, Transaction, transactionData } from "../data/sampleData";
import { styles as transactionStyles } from "../styles/transactionStyles";

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
      </View>
    </View>
  );
}