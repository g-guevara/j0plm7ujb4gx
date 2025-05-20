import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";


import { Transaction } from "../../data/sampleData";

// Available categories with their icon names
const CATEGORIES = [
  { name: "Groceries", icon: "cart-outline", color: "#2ecc71" },
  { name: "Rent", icon: "home-outline", color: "#f39c12" },
  { name: "Bills", icon: "receipt-outline", color: "#e74c3c" },
  { name: "Transportation", icon: "car-outline", color: "#3498db" },
  { name: "Dining", icon: "restaurant-outline", color: "#9b59b6" },
  { name: "Shopping", icon: "bag-outline", color: "#1abc9c" },
  { name: "Healthcare", icon: "medical-outline", color: "#34495e" },
  { name: "Entertainment", icon: "film-outline", color: "#e67e22" },
  { name: "Insurance", icon: "shield-outline", color: "#f1c40f" },
  { name: "Education", icon: "school-outline", color: "#8e44ad" },
  { name: "Fitness", icon: "fitness-outline", color: "#2980b9" },
  { name: "Travel", icon: "airplane-outline", color: "#16a085" }
];

interface CategorySelectionModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onSelectCategory: (category: string, transactionId: number) => void;
}

const CategorySelectionModal: React.FC<CategorySelectionModalProps> = ({
  visible,
  transaction,
  onClose,
  onSelectCategory
}) => {
  // Render category item
  const renderCategoryItem = ({ item }: { item: typeof CATEGORIES[0] }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => {
        if (transaction) {
          onSelectCategory(item.name, transaction.id);
        }
      }}
    >
      <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon as any} size={24} color="white" />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          {transaction && (
            <Text style={styles.transactionName}>
              Transaction: {transaction.name}
            </Text>
          )}
          
          <FlatList
            data={CATEGORIES}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.name}
            numColumns={3}
            contentContainerStyle={styles.categoriesList}
          />
          
          <TouchableOpacity style={styles.addCategoryButton}>
            <Ionicons name="add-circle" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Add Category</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 30,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  transactionName: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    marginBottom: 16,
  },
  categoriesList: {
    paddingVertical: 16,
  },
  categoryItem: {
    width: "33.33%",
    alignItems: "center",
    marginBottom: 20,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
  },
  addCategoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default CategorySelectionModal;