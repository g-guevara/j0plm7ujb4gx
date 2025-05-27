import React from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Card } from "../data/sampleData";

import { styles } from "../styles/CardEditStyles";

interface CardEditModalsProps {
  showAddCardModal: boolean;
  showEditCardModal: boolean;
  newCardName: string;
  newCardColor: string;
  editingCard: Card | null;
  setNewCardName: (name: string) => void;
  setNewCardColor: (color: string) => void;
  setShowAddCardModal: (show: boolean) => void;
  setShowEditCardModal: (show: boolean) => void;
  setEditingCard: (card: Card | null) => void;
  handleAddCard: () => void;
  handleUpdateCard: () => void;
}

export const CardEditModals: React.FC<CardEditModalsProps> = ({
  showAddCardModal,
  showEditCardModal,
  newCardName,
  newCardColor,
  editingCard,
  setNewCardName,
  setNewCardColor,
  setShowAddCardModal,
  setShowEditCardModal,
  setEditingCard,
  handleAddCard,
  handleUpdateCard
}) => {

  

const colorOptions = [
  "rgba(255, 23, 68, 0.3)",   // rojo fluor
  "rgba(224, 64, 251, 0.3)",  // púrpura neón
  "rgba(92, 107, 192, 0.3)",  // azul oscuro saturado
  "rgba(0, 128, 255, 0.3)",   // azul profundo brillante
  "rgba(0, 191, 255, 0.3)",   // azul fluor
  "rgba(0, 255, 162, 0.1)",   // verde aqua fluor
  "rgba(0, 230, 118, 0.2)",   // verde neón
];



  


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

  return (
    <>
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
    </>
  );
};