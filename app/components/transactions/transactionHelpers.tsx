import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Transaction } from "../../data/sampleData";
import { getAllCategories } from "../../services/storage";
import { styles } from "../../styles/transactionStyles";

/**
 * Format currency values for display with safety checks
 */
export const formatCurrency = (amount: number) => {
  // Check for NaN, undefined, or invalid values
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "$0.0";
  }
  
  // For transaction amounts - showing one decimal place
  return "$" + amount.toFixed(1);
};

/**
 * Get appropriate icon name based on transaction category from storage
 */
export const getCategoryIcon = (category: string) => {
  // Ensure category is a valid string
  if (!category || typeof category !== 'string') {
    return 'cube-outline'; // Default icon
  }
  
  // Get all categories from storage
  const categories = getAllCategories();
  
  // Find the category in storage (case insensitive)
  const foundCategory = categories.find(
    cat => cat.name.toLowerCase() === category.toLowerCase()
  );
  
  // If found in storage, use that icon
  if (foundCategory && foundCategory.icon) {
    return foundCategory.icon;
  }
  
  // Fallback to hardcoded mapping for backward compatibility
  let iconName;
  
  switch (category.toLowerCase()) {
    case 'groceries':
      iconName = 'cart-outline';
      break;
    case 'rent':
      iconName = 'home-outline';
      break;
    case 'insurance':
      iconName = 'shield-outline';
      break;
    case 'bills':
      iconName = 'receipt-outline';
      break;
    case 'transportation':
      iconName = 'car-outline';
      break;
    case 'dining':
      iconName = 'restaurant-outline';
      break;
    case 'shopping':
      iconName = 'bag-outline';
      break;
    case 'healthcare':
      iconName = 'medical-outline';
      break;
    case 'health':
      iconName = 'medical-outline';
      break;
    case 'food':
      iconName = 'restaurant-outline';
      break;
    case 'housing':
      iconName = 'home-outline';
      break;
    case 'life and entertainment':
    case 'entertainment':
      iconName = 'film-outline';
      break;
    case 'financial expenses':
      iconName = 'receipt-outline';
      break;
    case 'income':
      iconName = 'trending-up-outline';
      break;
    case 'clothes':
      iconName = 'shirt-outline';
      break;
    case 'software':
      iconName = 'code-outline';
      break;
    case 'investments':
      iconName = 'trending-up';
      break;
    case 'others':
      iconName = 'cube-outline';
      break;
    default:
      iconName = 'cube-outline';
      break;
  }
  
  return iconName;
};

/**
 * Get appropriate color based on transaction category from storage
 */
export const getCategoryColor = (category: string) => {
  // Ensure category is a valid string
  if (!category || typeof category !== 'string') {
    return '#3498db'; // Default blue
  }
  
  // Get all categories from storage
  const categories = getAllCategories();
  
  // Find the category in storage (case insensitive)
  const foundCategory = categories.find(
    cat => cat.name.toLowerCase() === category.toLowerCase()
  );
  
  // If found in storage, use that color
  if (foundCategory && foundCategory.color) {
    return foundCategory.color;
  }
  
  // Fallback to hardcoded mapping for backward compatibility
  let backgroundColor = "#3498db"; // Default blue
  
  // Customize color based on category
  switch((category || '').toLowerCase()) {
    case 'groceries':
    case 'food':
      backgroundColor = "#2ecc71"; // Green
      break;
    case 'rent':
    case 'housing':
      backgroundColor = "#f39c12"; // Orange
      break;
    case 'insurance':
      backgroundColor = "#f1c40f"; // Yellow
      break;
    case 'bills':
    case 'financial expenses':
      backgroundColor = "#e74c3c"; // Red
      break;
    case 'entertainment':
    case 'life and entertainment':
      backgroundColor = "#9b59b6"; // Purple
      break;
    case 'transportation':
      backgroundColor = "#3498db"; // Blue
      break;
    case 'dining':
      backgroundColor = "#e67e22"; // Dark orange
      break;
    case 'shopping':
      backgroundColor = "#1abc9c"; // Teal
      break;
    case 'healthcare':
    case 'health':
      backgroundColor = "#2980b9"; // Dark blue
      break;
    case 'income':
      backgroundColor = "#2ecc71"; // Green
      break;
    case 'clothes':
      backgroundColor = "#74b9ff"; // Sky blue
      break;
    case 'software':
      backgroundColor = "#8e44ad"; // Dark purple
      break;
    case 'investments':
      backgroundColor = "#16a085"; // Dark teal
      break;
    case 'others':
      backgroundColor = "#00cec9"; // Cyan
      break;
    default:
      backgroundColor = "#3498db"; // Default blue
      break;
  }
  
  return backgroundColor;
};

export const renderTransactionIcon = (category: string) => {
  const iconName = getCategoryIcon(category);
  const backgroundColor = getCategoryColor(category);
  
  return (
    <View style={[styles.transactionIcon, { backgroundColor }]}>
      <Ionicons 
        name={iconName as any} 
        size={18} 
        color="#FFFFFF" 
      />
    </View>
  );
};

/**
 * Group transactions by date for SectionList with safety checks
 */
export const groupTransactionsByDate = (transactions: Transaction[]) => {
  // Check for valid transactions array
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return [];
  }
  
  const groupedData: { title: string; data: Transaction[]; total: number }[] = [];
  const dateMap = new Map<string, { transactions: Transaction[], total: number }>();

  // Sort transactions by date (newest first), with safety check for invalid dates
  const sortedTransactions = [...transactions]
    .filter(t => t && t.date && !isNaN(new Date(t.date).getTime())) // Filter out invalid dates
    .sort((a, b) => {
      try {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } catch (e) {
        // If date parsing fails, return 0 (keep order)
        return 0;
      }
    });
  
  // If all transactions had invalid dates, return empty array
  if (sortedTransactions.length === 0) {
    return [];
  }
  
  // Group by date
  sortedTransactions.forEach(transaction => {
    try {
      const date = transaction.date;
      const dateObj = new Date(date);
      
      // Skip invalid dates
      if (isNaN(dateObj.getTime())) {
        return;
      }
      
      // Format date as "Monday, 26 May" or similar
      const formattedDate = dateObj.toLocaleDateString('en-US', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
      
      if (!dateMap.has(formattedDate)) {
        dateMap.set(formattedDate, { transactions: [], total: 0 });
      }
      
      const group = dateMap.get(formattedDate)!;
      group.transactions.push(transaction);
      
      // Handle NaN values safely
      const amount = typeof transaction.mount === 'number' && !isNaN(transaction.mount) 
        ? transaction.mount 
        : 0;
        
      group.total += amount;
    } catch (error) {
      // Skip transaction on error
      console.error('Error processing transaction:', error);
    }
  });
  
  // Convert map to array for SectionList
  dateMap.forEach((value, key) => {
    groupedData.push({
      title: key,
      data: value.transactions,
      total: value.total
    });
  });
  
  return groupedData;
};