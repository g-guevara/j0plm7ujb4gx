import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Image, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { Card, cardData } from "../data/sampleData";


import { CardEditModals } from "../components/CardEditModals";
import { styles } from "../styles/CardEditStyles";

export default function CardEditScreen() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showEditCardModal, setShowEditCardModal] = useState(false);
  const [newCardName, setNewCardName] = useState("");
  const [newCardColor, setNewCardColor] = useState("#3498db");
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  
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