import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";



import { Transaction } from "../../data/sampleData";



import { styles } from "../../styles/transactionStyles";

/**
 * Format currency values for display
 */
export const formatCurrency = (amount: number) => {
  // For transaction amounts - showing one decimal place
  return "US$" + amount.toFixed(1);
};

/**
 * Get appropriate icon name based on transaction category
 */
export const getCategoryIcon = (category: string) => {
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
  switch(category.toLowerCase()) {
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
 * Group transactions by date for SectionList
 */
export const groupTransactionsByDate = (transactions: Transaction[]) => {
  const groupedData: { title: string; data: Transaction[]; total: number }[] = [];
  const dateMap = new Map<string, { transactions: Transaction[], total: number }>();

  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Group by date
  sortedTransactions.forEach(transaction => {
    const date = transaction.date;
    const dateObj = new Date(date);
    
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
    group.total += transaction.mount;
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