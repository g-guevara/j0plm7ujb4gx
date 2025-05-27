import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Transaction } from "../../data/sampleData";
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
 * Get appropriate icon name based on transaction category
 */
export const getCategoryIcon = (category: string) => {
  // Ensure category is a valid string
  if (!category || typeof category !== 'string') {
    return 'cube-outline'; // Default icon
  }
  
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
    default:
      iconName = 'cube-outline';
      break;
  }
  
  return iconName;
};

export const renderTransactionIcon = (category: string) => {
  const iconName = getCategoryIcon(category);
  let backgroundColor = "#3498db"; // Default blue
  
  // Customize icon color based on category
  switch((category || '').toLowerCase()) {
    case 'groceries':
      backgroundColor = "#2ecc71"; // Green
      break;
    case 'rent':
      backgroundColor = "#f39c12"; // Orange
      break;
    case 'insurance':
      backgroundColor = "#f1c40f"; // Yellow
      break;
    case 'bills':
      backgroundColor = "#e74c3c"; // Red
      break;
    case 'entertainment':
      backgroundColor = "#9b59b6"; // Purple
      break;
  }
  
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