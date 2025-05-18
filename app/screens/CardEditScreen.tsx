import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { Card, cardData } from "../data/sampleData";

export default function CardEditScreen() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showEditCardModal, setShowEditCardModal] = useState(false);
  const [newCardName, setNewCardName] = useState("");
  const [newCardColor, setNewCardColor] = useState("#3498db");
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  
  const colorOptions = ["#3498db", "#2ecc71", "#e74c3c", "#f39c12", "#9b59b6", "#1abc9c", "#34495e", "#e67e22"];

  // Load all cards
  useEffect(() => {
    setCards([...cardData]);
  }, []);

  // Handle creating a new card
  const handleAddCard = () => {
    if (!newCardName.trim()) {
      Alert.alert("Error", "Please enter a card name");
      return;
    }

    const newId = Math.max(...cards.map(c => c.id)) + 1;
    const newCard: Card = {
      id: newId,
      name: newCardName,
      color: newCardColor,
      selected: false
    };
    
    setCards([...cards, newCard]);
    cardData.push(newCard); // Update the original data source
    
    setShowAddCardModal(false);
    setNewCardName("");
  };

  // Handle updating a card
  const handleUpdateCard = () => {
    if (!editingCard) return;
    
    if (!newCardName.trim()) {
      Alert.alert("Error", "Please enter a card name");
      return;
    }

    const updatedCards = cards.map(card => 
      card.id === editingCard.id 
        ? { ...card, name: newCardName, color: newCardColor }
        : card
    );
    
    setCards(updatedCards);
    
    // Update the original data source
    const index = cardData.findIndex(card => card.id === editingCard.id);
    if (index !== -1) {
      cardData[index].name = newCardName;
      cardData[index].color = newCardColor;
    }
    
    setShowEditCardModal(false);
    setEditingCard(null);
    setNewCardName("");
  };

  // Handle deleting a card
  const handleDeleteCard = (card: Card) => {
    Alert.alert(
      "Delete Card",
      `Are you sure you want to delete "${card.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedCards = cards.filter(c => c.id !== card.id);
            setCards(updatedCards);
            
            // Update the original data source
            const index = cardData.findIndex(c => c.id === card.id);
            if (index !== -1) {
              cardData.splice(index, 1);
            }
          }
        }
      ]
    );
  };

  // Open edit modal for a card
  const openEditModal = (card: Card) => {
    setEditingCard(card);
    setNewCardName(card.name);
    setNewCardColor(card.color);
    setShowEditCardModal(true);
  };

  // Render color option for card creation/editing
  const renderColorOption = (color: string) => (
    <TouchableOpacity
      key={color}
      style={[
        styles.colorOption,
        { backgroundColor: color },
        (showAddCardModal ? newCardColor : editingCard?.color) === color && styles.selectedColorOption
      ]}
      onPress={() => setNewCardColor(color)}
    />
  );

  // Render each card item
  const renderCard = ({ item }: { item: Card }) => {
    return (
      <TouchableOpacity
        style={styles.cardItem}
        activeOpacity={0.7}
      >
        <View style={styles.cardInfo}>
          <View style={[styles.cardColorIndicator, { backgroundColor: item.color }]} />
          <Text style={styles.cardName}>{item.name}</Text>
          {item.selected && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedText}>Selected</Text>
            </View>
          )}
        </View>
        
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.cardAction}
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="pencil" size={22} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cardAction}
            onPress={() => handleDeleteCard(item)}
          >
            <Ionicons name="trash-outline" size={22} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background image */}
      <Image
        source={require('../../assets/images/dashboard-bg.png')}
        style={styles.background}
        resizeMode="cover"
      />
      
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Cards</Text>
          </View>
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddCardModal(true)}
          >
            <Text style={styles.addButtonText}>+ Add Card</Text>
          </TouchableOpacity>
        </View>
        
        {/* Card List */}
        <FlatList
          data={cards}
          renderItem={renderCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.cardsList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No cards found. Add a new card to get started.</Text>
          }
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

      {/* Edit Card Modal */}
      <Modal
        visible={showEditCardModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Card</Text>
            
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
                  setShowEditCardModal(false);
                  setEditingCard(null);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateCard}
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
  },
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
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 95,
    paddingBottom: 16,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
  },
  addButton: {
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
  cardsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  cardItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cardColorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  selectedBadge: {
    marginLeft: 10,
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedText: {
    fontSize: 12,
    color: "#2196f3",
    fontWeight: "500",
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardAction: {
    padding: 8,
    marginLeft: 8,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#666",
    fontSize: 16,
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