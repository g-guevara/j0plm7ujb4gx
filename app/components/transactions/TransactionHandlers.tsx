import { Router } from "expo-router";
import { Alert } from "react-native";
import {
    addCard,
    Card,
    selectCard,
    Transaction,
    transactionData
} from "../../data/sampleData";

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
    router
  } = props;

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

  return {
    handleTransactionPress,
    handleCardSelect,
    handleAddCard,
    handleScanPress
  };
};