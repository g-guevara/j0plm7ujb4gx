import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    FlatList,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { Card, cardData } from "../../data/sampleData";

interface CardFilterDropdownProps {
  selectedCardId: number | null;
  onCardSelect: (cardId: number) => void;
}

const CardFilterDropdown: React.FC<CardFilterDropdownProps> = ({
  selectedCardId,
  onCardSelect
}) => {
  const [showModal, setShowModal] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Load cards and find selected card
  useEffect(() => {
    const loadCards = () => {
      // Create a copy of card data
      const loadedCards = [...cardData];
      setCards(loadedCards);
      
      // Find selected card
      if (selectedCardId) {
        const card = loadedCards.find(c => c.id === selectedCardId);
        setSelectedCard(card || null);
      } else {
        setSelectedCard(null);
      }
    };

    loadCards();
  }, [selectedCardId]);

  // Handle card selection
  const handleCardSelect = (card: Card) => {
    onCardSelect(card.id);
    setSelectedCard(card);
    setShowModal(false);
  };

  // Render card item
  const renderCardItem = ({ item }: { item: Card }) => (
    <TouchableOpacity
      style={[
        styles.cardItem,
        selectedCardId === item.id && styles.selectedCardItem
      ]}
      onPress={() => handleCardSelect(item)}
    >
      <View style={styles.cardLeft}>
        <View
          style={[styles.cardColorIndicator, { backgroundColor: item.color }]}
        />
        <Text style={styles.cardName}>{item.name}</Text>
      </View>
      
      {selectedCardId === item.id && (
        <Ionicons name="checkmark" size={22} color="#3498db" />
      )}
    </TouchableOpacity>
  );

  // Add "All Cards" option
  const allCardsOption: Card = {
    id: 0,
    name: "All Cards",
    color: "#555555"
  };

  return (
    <>
      <TouchableOpacity
        style={styles.filterDropdown}
        onPress={() => setShowModal(true)}
      >
        {selectedCard ? (
          <View style={styles.selectedCardPreview}>
            <View 
              style={[
                styles.cardColorDot, 
                { backgroundColor: selectedCard.color }
              ]} 
            />
            <Text style={styles.filterText}>{selectedCard.name}</Text>
          </View>
        ) : (
          <Text style={styles.filterText}>All Cards</Text>
        )}
        <Ionicons name="chevron-down" size={16} color="#333" />
      </TouchableOpacity>

      {/* Card Selection Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Card</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={[allCardsOption, ...cards]}
              renderItem={renderCardItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.cardsList}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  filterDropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
  },
  filterText: {
    fontSize: 16,
    fontWeight: "500",
    marginRight: 8,
  },
  selectedCardPreview: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cardColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  cardsList: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  selectedCardItem: {
    backgroundColor: "#f8f8f8",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardColorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
});

export default CardFilterDropdown;