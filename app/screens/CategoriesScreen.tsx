// app/screens/CategoriesScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    Modal,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { transactionData } from "../data/sampleData";

interface Category {
  name: string;
  icon: string;
  color: string;
  transactionCount: number;
  totalAmount: number;
}

export default function CategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
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
    "shield-outline", "school-outline", "fitness-outline", "airplane-outline",
    "game-controller-outline", "cafe-outline", "library-outline", "heart-outline"
  ];

  // Available colors for categories
  const availableColors = [
    "#3498db", "#2ecc71", "#e74c3c", "#f39c12", 
    "#9b59b6", "#1abc9c", "#34495e", "#e67e22",
    "#f1c40f", "#8e44ad", "#2980b9", "#16a085"
  ];

  // Load categories from transaction data
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    // Get unique categories from transactions
    const categoryMap = new Map<string, { count: number; total: number }>();
    
    transactionData.forEach(transaction => {
      const category = transaction.category;
      if (categoryMap.has(category)) {
        const existing = categoryMap.get(category)!;
        categoryMap.set(category, {
          count: existing.count + 1,
          total: existing.total + transaction.mount
        });
      } else {
        categoryMap.set(category, {
          count: 1,
          total: transaction.mount
        });
      }
    });

    // Convert to category objects with default icons and colors
    const categoryList: Category[] = Array.from(categoryMap.entries()).map(([name, stats], index) => {
      let icon = "cube-outline";
      let color = availableColors[index % availableColors.length];
      
      // Set default icons based on category name
      switch (name.toLowerCase()) {
        case 'groceries':
          icon = "cart-outline";
          color = "#2ecc71";
          break;
        case 'rent':
          icon = "home-outline";
          color = "#f39c12";
          break;
        case 'bills':
          icon = "receipt-outline";
          color = "#e74c3c";
          break;
        case 'transportation':
          icon = "car-outline";
          color = "#3498db";
          break;
        case 'dining':
          icon = "restaurant-outline";
          color = "#9b59b6";
          break;
        case 'shopping':
          icon = "bag-outline";
          color = "#1abc9c";
          break;
        case 'healthcare':
          icon = "medical-outline";
          color = "#34495e";
          break;
        case 'entertainment':
          icon = "film-outline";
          color = "#e67e22";
          break;
        case 'insurance':
          icon = "shield-outline";
          color = "#f1c40f";
          break;
      }

      return {
        name,
        icon,
        color,
        transactionCount: stats.count,
        totalAmount: stats.total
      };
    });

    // Sort by transaction count (most used first)
    categoryList.sort((a, b) => b.transactionCount - a.transactionCount);
    setCategories(categoryList);
  };

  // Handle adding a new category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }

    // Check if category already exists
    if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.toLowerCase())) {
      Alert.alert("Error", "This category already exists");
      return;
    }

    const newCategory: Category = {
      name: newCategoryName.trim(),
      icon: selectedIcon,
      color: selectedColor,
      transactionCount: 0,
      totalAmount: 0
    };

    setCategories([...categories, newCategory]);
    setShowAddModal(false);
    setNewCategoryName("");
    setSelectedIcon("cube-outline");
    setSelectedColor("#3498db");
    
    Alert.alert("Success", `Category "${newCategory.name}" has been added`);
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
  const handleUpdateCategory = () => {
    if (!newCategoryName.trim() || !editingCategory) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }

    const updatedCategories = categories.map(cat => 
      cat.name === editingCategory.name 
        ? { ...cat, name: newCategoryName.trim(), icon: selectedIcon, color: selectedColor }
        : cat
    );

    setCategories(updatedCategories);
    setShowEditModal(false);
    setEditingCategory(null);
    setNewCategoryName("");
    
    Alert.alert("Success", "Category has been updated");
  };

  // Handle deleting a category
  const handleDeleteCategory = (category: Category) => {
    if (category.transactionCount > 0) {
      Alert.alert(
        "Cannot Delete",
        `This category has ${category.transactionCount} transactions. You cannot delete a category that is being used.`,
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
          onPress: () => {
            const updatedCategories = categories.filter(cat => cat.name !== category.name);
            setCategories(updatedCategories);
            Alert.alert("Success", "Category has been deleted");
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
  const renderCategoryItem = ({ item }: { item: Category }) => (
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
          keyExtractor={(item) => item.name}
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