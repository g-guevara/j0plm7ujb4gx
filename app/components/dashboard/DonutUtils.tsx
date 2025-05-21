import { Ionicons } from "@expo/vector-icons";

// Constants for the dashboard screen
export const SEGMENTS = ["D", "W", "M", "6M", "Y"];
export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/**
 * Get the appropriate Ionicons icon name for a category
 * @param category The category name
 * @returns The Ionicons icon name
 */
export const getCategoryIcon = (category: string) => {
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
 * Format currency amount
 * @param amount Amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number) => {
  return `US$${amount.toFixed(0)}`;
};

/**
 * Calculate the total amount for a category
 * @param transactions Array of transactions
 * @param category Category to filter by
 * @returns Total amount for the category
 */
export const getCategoryTotal = (
  transactions: { category: string; mount: number }[],
  category: string
) => {
  return transactions
    .filter(t => t.category === category)
    .reduce((total, t) => total + t.mount, 0);
};