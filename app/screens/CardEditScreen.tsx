import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Image, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { CardEditModals } from "../components/CardEditModals";
import { Card } from "../data/sampleData";
import { styles } from "../styles/CardEditStyles";

// Import storage functions
import {
  addNewCard,
  deleteCard,
  getAllCards,
  updateCard
} from "../services/storage";

export default function CardEditScreen() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showEditCardModal, setShowEditCardModal] = useState(false);
  const [newCardName, setNewCardName] = useState("");
  const [newCardColor, setNewCardColor] = useState("#3498db");
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load all cards from storage
  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = () => {
    const allCards = getAllCards();
    setCards([...allCards]);
  };

  // Handle creating a new card with persistent storage
  const handleAddCard = async () => {
    if (!newCardName.trim()) {
      Alert.alert("Error", "Please enter a card name");
      return;
    }

    setIsLoading(true);
    try {
      // Use the storage function to add and save the card
      const newCard = await addNewCard(newCardName.trim(), newCardColor);
      
      // Reload cards from storage to get the updated list
      loadCards();
      
      setShowAddCardModal(false);
      setNewCardName("");
      setNewCardColor("#3498db");
      
      Alert.alert("Success", `Card "${newCard.name}" has been added successfully.`);
    } catch (error) {
      console.error('Error adding card:', error);
      Alert.alert("Error", "Failed to add card. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle updating a card with persistent storage
  const handleUpdateCard = async () => {
    if (!editingCard) return;
    
    if (!newCardName.trim()) {
      Alert.alert("Error", "Please enter a card name");
      return;
    }

    setIsLoading(true);
    try {
      // Create updated card object
      const updatedCard: Card = {
        ...editingCard,
        name: newCardName.trim(),
        color: newCardColor
      };
      
      // Use the storage function to update and save the card
      const success = await updateCard(updatedCard);
      
      if (success) {
        // Reload cards from storage to get the updated list
        loadCards();
        
        setShowEditCardModal(false);
        setEditingCard(null);
        setNewCardName("");
        setNewCardColor("#3498db");
        
        Alert.alert("Success", "Card has been updated successfully.");
      } else {
        throw new Error("Failed to update card");
      }
    } catch (error) {
      console.error('Error updating card:', error);
      Alert.alert("Error", "Failed to update card. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting a card with persistent storage
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
          onPress: async () => {
            setIsLoading(true);
            try {
              // Use the storage function to delete and save changes
              const success = await deleteCard(card.id);
              
              if (success) {
                // Reload cards from storage to get the updated list
                loadCards();
                Alert.alert("Success", "Card has been deleted successfully.");
              } else {
                throw new Error("Failed to delete card");
              }
            } catch (error) {
              console.error('Error deleting card:', error);
              Alert.alert("Error", "Failed to delete card. Please try again.");
            } finally {
              setIsLoading(false);
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
            disabled={isLoading}
          >
            <Ionicons name="pencil" size={22} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cardAction}
            onPress={() => handleDeleteCard(item)}
            disabled={isLoading}
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
            style={[styles.addButton, { opacity: isLoading ? 0.5 : 1 }]}
            onPress={() => setShowAddCardModal(true)}
            disabled={isLoading}
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
            <Text style={styles.emptyText}>
              {isLoading ? "Loading cards..." : "No cards found. Add a new card to get started."}
            </Text>
          }
        />
      </View>
      
      {/* Modals */}
      <CardEditModals
        showAddCardModal={showAddCardModal}
        showEditCardModal={showEditCardModal}
        newCardName={newCardName}
        newCardColor={newCardColor}
        editingCard={editingCard}
        setNewCardName={setNewCardName}
        setNewCardColor={setNewCardColor}
        setShowAddCardModal={setShowAddCardModal}
        setShowEditCardModal={setShowEditCardModal}
        setEditingCard={setEditingCard}
        handleAddCard={handleAddCard}
        handleUpdateCard={handleUpdateCard}
      />
    </View>
  );
}