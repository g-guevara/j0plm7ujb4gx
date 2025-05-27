// app/screens/CategoriesScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
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
import { Category, categoryData, transactionData } from "../data/sampleData";
import {
  addNewCategory,
  deleteCategoryById,
  isCategoryInUse,
  updateCategory
} from "../services/storage";

// Type for category with transaction statistics
type CategoryWithStats = Category & {
  transactionCount: number;
  totalAmount: number;
};

export default function CategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("cube-outline");
  const [selectedColor, setSelectedColor] = useState("#3498db");

  // Available icons for categories
  const availableIcons = [
    "cart-outline", "home-outline", "receipt-outline", "car-outline",
    "restaurant-outline", "bag-outline", "medical-outline", "film-outline",
     "school-outline", "fitness-outline", "airplane-outline",
    "game-controller-outline", "cafe-outline", "library-outline",
     "heart-outline", "trending-up", "code-outline", "shirt-outline",
    "cube-outline", "card-outline", 
  ];

// Available colors for categories - Cool colors only
const availableColors = [
    "#3498db", // Light blue
    "#2ecc71", // Green
    "#1abc9c", // Teal
    "#9b59b6", // Purple
    "#34495e", // Dark blue-gray
    "#8e44ad", // Dark purple
    "#2980b9", // Blue
    "#16a085", // Dark teal
    "#27ae60", // Dark green
    "#6c5ce7", // Light purple
    "#74b9ff", // Sky blue
    "#00cec9"  // Cyan
];

  // Load categories when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

  const loadCategories = () => {
    console.log('Loading categories from storage...');
    
    // Load categories from the global categoryData array
    const loadedCategories = [...categoryData];
    
    // Add transaction counts for each category
    const categoriesWithStats = loadedCategories.map(category => {
      const transactionCount = transactionData.filter(
        transaction => transaction.category.toLowerCase() === category.name.toLowerCase()
      ).length;
      
      const totalAmount = transactionData
        .filter(transaction => transaction.category.toLowerCase() === category.name.toLowerCase())
        .reduce((sum, transaction) => sum + transaction.mount, 0);

      return {
        ...category,
        transactionCount,
        totalAmount
      };
    });

    setCategories(categoriesWithStats);
    console.log(`Loaded ${categoriesWithStats.length} categories`);
  };

  // Handle adding a new category
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }

    // Check if category already exists
    if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.toLowerCase())) {
      Alert.alert("Error", "This category already exists");
      return;
    }

    try {
      // Add the new category using the storage service
      const newCategory = await addNewCategory(newCategoryName.trim(), selectedIcon, selectedColor);
      
      // Reload categories to get updated data
      loadCategories();
      
      // Reset form
      setShowAddModal(false);
      setNewCategoryName("");
      setSelectedIcon("cube-outline");
      setSelectedColor("#3498db");
      
      Alert.alert("Success", `Category "${newCategory.name}" has been added`);
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert("Error", "Failed to add category. Please try again.");
    }
  };

  // Handle editing a category
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setSelectedIcon(category.icon);
    setSelectedColor(category.color);
    setShowEditModal(true);
  };

  // Handle updating a category
  const handleUpdateCategory = async () => {
    if (!newCategoryName.trim() || !editingCategory) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }

    try {
      // Create updated category object
      const updatedCategory: Category = {
        ...editingCategory,
        name: newCategoryName.trim(),
        icon: selectedIcon,
        color: selectedColor
      };

      // Update the category using the storage service
      const success = await updateCategory(updatedCategory);
      
      if (success) {
        // Update any existing transactions that use the old category name
        const oldName = editingCategory.name;
        const newName = newCategoryName.trim();
        
        if (oldName !== newName) {
          // Update all transactions with the old category name
          transactionData.forEach(transaction => {
            if (transaction.category.toLowerCase() === oldName.toLowerCase()) {
              transaction.category = newName;
            }
          });
        }
        
        // Reload categories to get updated data
        loadCategories();
        
        // Reset form
        setShowEditModal(false);
        setEditingCategory(null);
        setNewCategoryName("");
        
        Alert.alert("Success", "Category has been updated");
      } else {
        throw new Error("Failed to update category");
      }
    } catch (error) {
      console.error('Error updating category:', error);
      Alert.alert("Error", "Failed to update category. Please try again.");
    }
  };

  // Handle deleting a category
  const handleDeleteCategory = async (category: Category) => {
    // Check if category is being used
    if (isCategoryInUse(category.name)) {
      const transactionCount = transactionData.filter(
        t => t.category.toLowerCase() === category.name.toLowerCase()
      ).length;
      
      Alert.alert(
        "Cannot Delete",
        `This category has ${transactionCount} transaction${transactionCount !== 1 ? 's' : ''}. You cannot delete a category that is being used.`,
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await deleteCategoryById(category.id);
              
              if (success) {
                // Reload categories to get updated data
                loadCategories();
                Alert.alert("Success", "Category has been deleted");
              } else {
                throw new Error("Failed to delete category");
              }
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert("Error", "Failed to delete category. Please try again.");
            }
          }
        }
      ]
    );
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `$${Math.abs(amount).toLocaleString()}`;
  };

  // Render category item
  const renderCategoryItem = ({ item }: { item: CategoryWithStats }) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryLeft}>
          <View style={[styles.categoryIconContainer, { backgroundColor: item.color }]}>
            <Ionicons name={item.icon as any} size={24} color="white" />
          </View>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>{item.name}</Text>
            <Text style={styles.categoryStats}>
              {item.transactionCount} transactions • {formatCurrency(item.totalAmount)}
            </Text>
          </View>
        </View>
        <View style={styles.categoryActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditCategory(item)}
          >
            <Ionicons name="pencil" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteCategory(item)}
          >
            <Ionicons name="trash-outline" size={20} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Render icon selector
  const renderIconSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>Select Icon</Text>
      <View style={styles.iconGrid}>
        {availableIcons.map((icon) => (
          <TouchableOpacity
            key={icon}
            style={[
              styles.iconOption,
              selectedIcon === icon && styles.selectedIconOption
            ]}
            onPress={() => setSelectedIcon(icon)}
          >
            <Ionicons name={icon as any} size={24} color={selectedIcon === icon ? "white" : "#666"} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Render color selector
  const renderColorSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>Select Color</Text>
      <View style={styles.colorGrid}>
        {availableColors.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              selectedColor === color && styles.selectedColorOption
            ]}
            onPress={() => setSelectedColor(color)}
          />
        ))}
      </View>
    </View>
  );

  // Category Modal Component
  const CategoryModal = ({ visible, isEdit }: { visible: boolean; isEdit: boolean }) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => {
        if (isEdit) {
          setShowEditModal(false);
          setEditingCategory(null);
        } else {
          setShowAddModal(false);
        }
        setNewCategoryName("");
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEdit ? "Edit Category" : "Add New Category"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (isEdit) {
                  setShowEditModal(false);
                  setEditingCategory(null);
                } else {
                  setShowAddModal(false);
                }
                setNewCategoryName("");
              }}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.textInput}
            placeholder="Category Name"
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            maxLength={25}
          />

          {renderIconSelector()}
          {renderColorSelector()}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                if (isEdit) {
                  setShowEditModal(false);
                  setEditingCategory(null);
                } else {
                  setShowAddModal(false);
                }
                setNewCategoryName("");
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={isEdit ? handleUpdateCategory : handleAddCategory}
            >
              <Text style={styles.buttonText}>{isEdit ? "Update" : "Add"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

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
            <Text style={styles.headerTitle}>Categories</Text>
          </View>
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Category Overview</Text>
          <Text style={styles.summaryText}>
            You have {categories.length} categories managing {transactionData.length} transactions
          </Text>
        </View>
        
        {/* Category List */}
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.categoryList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="pricetags-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No categories found</Text>
              <Text style={styles.emptySubtext}>Add a new category to get started</Text>
            </View>
          }
        />
      </View>
      
      {/* Add Category Modal */}
      <CategoryModal visible={showAddModal} isEdit={false} />
      
      {/* Edit Category Modal */}
      <CategoryModal visible={showEditModal} isEdit={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"#fff",
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'transparent',
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
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  summaryText: {
    fontSize: 14,
    color: "#666",
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  categoryItem: {
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
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  categoryStats: {
    fontSize: 14,
    color: "#666",
  },
  categoryActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  textInput: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  selectorContainer: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 8,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    marginRight: 8,
  },
  selectedIconOption: {
    backgroundColor: "#3498db",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColorOption: {
    borderColor: "#333",
    borderWidth: 3,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
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