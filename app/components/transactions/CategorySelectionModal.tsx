import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { Category, Transaction } from "../../data/sampleData";
import { getAllCategories } from "../../services/storage";

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
  const [categories, setCategories] = useState<Category[]>([]);

  // Load categories when the modal becomes visible
  useEffect(() => {
    if (visible) {
      loadCategories();
    }
  }, [visible]);

  const loadCategories = () => {
    // Get categories from storage (user's categories)
    const userCategories = getAllCategories();
    setCategories(userCategories);
  };

  // Render category item
  const renderCategoryItem = ({ item }: { item: Category }) => (
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
          
          {categories.length > 0 ? (
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={3}
              contentContainerStyle={styles.categoriesList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No categories available</Text>
              <Text style={styles.emptyStateSubtext}>
                Add categories in Profile → Categories
              </Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.addCategoryButton}
            onPress={() => {
              // Close this modal and optionally navigate to categories screen
              onClose();
              // Note: You could add navigation to categories screen here if needed
            }}
          >
            <Ionicons name="add-circle" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Manage Categories</Text>
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
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