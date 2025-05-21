import { Ionicons } from "@expo/vector-icons";

// Constants for the dashboard screen
export const SEGMENTS = ["D", "W", "M", "6M", "Y"];
export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/**
 * Get the appropriate Ionicons icon name for a category with safety checks
 * @param category The category name
 * @returns The Ionicons icon name
 */
export const getCategoryIcon = (category: string) => {
  // Default icon if category is invalid
  if (!category || typeof category !== 'string') {
    return "cube-outline";
  }
  
  let iconName;
  
  switch (category.toLowerCase()) {
    case 'groceries':
      iconName = "cart-outline";
      break;
    case 'rent':
      iconName = "home-outline";
      break;
    case 'bills':
      iconName = "receipt-outline";
      break;
    case 'electronics':
      iconName = "hardware-chip-outline";
      break;
    case 'entertainment':
      iconName = "film-outline";
      break;
    case 'transportation':
      iconName = "car-outline";
      break;
    case 'dining':
    case 'restaurant':
      iconName = "restaurant-outline";
      break;
    case 'shopping':
      iconName = "bag-outline";
      break;
    case 'healthcare':
      iconName = "medical-outline";
      break;
    case 'gas':
      iconName = "flame-outline";
      break;
    default:
      iconName = "cube-outline";
      break;
  }
  
  return iconName as keyof typeof Ionicons.glyphMap;
};

/**
 * Format currency amount with safety checks
 * @param amount Amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number) => {
  // Check for NaN or invalid values
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "US$0";
  }
  
  return `US$${amount.toFixed(0)}`;
};

/**
 * Calculate the total amount for a category with safety checks
 * @param transactions Array of transactions
 * @param category Category to filter by
 * @returns Total amount for the category
 */
export const getCategoryTotal = (
  transactions: { category: string; mount: number }[],
  category: string
) => {
  // Return 0 for invalid inputs
  if (!Array.isArray(transactions) || !category) {
    return 0;
  }
  
  return transactions
    .filter(t => t && t.category === category)
    .map(t => {
      // Ensure mount is a valid number
      return typeof t.mount === 'number' && !isNaN(t.mount) ? t.mount : 0;
    })
    .reduce((total, mount) => total + mount, 0);
};