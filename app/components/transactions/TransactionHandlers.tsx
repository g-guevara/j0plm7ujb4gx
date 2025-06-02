import { Router } from "expo-router";
import { Alert } from "react-native";
import {
  Card,
  Transaction
} from "../../data/sampleData";

// Import storage functions
import {
  addNewCard,
  getAllCards,
  getAllTransactions,
  selectCard
} from "../../services/storage";

interface TransactionHandlersProps {
  cards: Card[];
  setCards: React.Dispatch<React.SetStateAction<Card[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  showAddCardModal: boolean;
  setShowAddCardModal: React.Dispatch<React.SetStateAction<boolean>>;
  newCardName: string;
  setNewCardName: React.Dispatch<React.SetStateAction<string>>;
  newCardColor: string;
  setNewCardColor: React.Dispatch<React.SetStateAction<string>>;
  router: Router;
}

export const TransactionHandlers = (props: TransactionHandlersProps) => {
  const {
    cards,
    setCards,
    setTransactions,
    setShowAddCardModal,
    newCardName,
    setNewCardName,
    newCardColor,
    setNewCardColor,
    router
  } = props;

  // Navigate to details screen with transaction data
  const handleTransactionPress = (transaction: Transaction) => {
    router.push({
      pathname: "/screens/DetailsScreen",
      params: { transactionId: transaction.id.toString() }
    });
  };

  // Handle card selection with persistent storage
  const handleCardSelect = async (cardId: number) => {
    try {
      // Use the storage function to select and save the card
      await selectCard(cardId);
      
      // Reload cards from storage to get updated selection
      const updatedCards = getAllCards();
      
      // Add "All" option and update state
      const allCardsOption: Card = {
        id: 0,
        name: "All",
        color: "#555555",
        selected: cardId === 0
      };
      
      const cardsWithAllOption = [
        allCardsOption, 
        ...updatedCards.map(card => ({
          ...card,
          selected: card.id === cardId
        }))
      ];
      
      setCards(cardsWithAllOption);

      // Filter transactions based on selection
      if (cardId === 0) {
        // Show all transactions
        const allTransactions = getAllTransactions();
        setTransactions(allTransactions);
      } else {
        // Filter transactions to show only those for the selected card
        const allTransactions = getAllTransactions();
        const filteredTransactions = allTransactions.filter(
          transaction => transaction.cardId === cardId
        );
        setTransactions(filteredTransactions);
      }
    } catch (error) {
      console.error('Error selecting card:', error);
      Alert.alert("Error", "Failed to select card. Please try again.");
    }
  };

  // Handle creating a new card with persistent storage
  const handleAddCard = async () => {
    if (!newCardName.trim()) {
      Alert.alert("Error", "Please enter a card name");
      return;
    }

    try {
      // Use the storage function to add and save the card
      const newCard = await addNewCard(newCardName.trim(), newCardColor);
      
      // Reload cards from storage to get the updated list
      const updatedCards = getAllCards();
      
      // Add "All" option back to the list
      const allCardsOption: Card = {
        id: 0,
        name: "All",
        color: "#555555",
        selected: true
      };
      
      const cardsWithAllOption = [allCardsOption, ...updatedCards];
      setCards(cardsWithAllOption);
      
      setShowAddCardModal(false);
      setNewCardName("");
      setNewCardColor("#3498db");
      
      Alert.alert("Success", `Card "${newCard.name}" has been added successfully.`);
    } catch (error) {
      console.error('Error adding card:', error);
      Alert.alert("Error", "Failed to add card. Please try again.");
    }
  };

  // Handle adding transaction manually
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
    
    // Navigate to a manual transaction entry screen or open a modal
    // For now, we'll show an alert indicating the feature is coming
    Alert.alert(
      "Add Transaction Manually",
      "This will open the manual transaction entry form.",
      [
        { text: "Cancel" },
        { 
          text: "Continue", 
          onPress: () => {
            // You can implement a modal here or navigate to a new screen
            console.log("Opening manual transaction entry for card:", selectedCard.id);
            // TODO: Implement manual transaction entry
          }
        }
      ]
    );
  };

  // Navigate to scan screen (renamed from handleScanPress)
  const handleScanFiles = () => {
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

  return {
    handleTransactionPress,
    handleCardSelect,
    handleAddCard,
    handleAddManually,
    handleScanFiles
  };
};