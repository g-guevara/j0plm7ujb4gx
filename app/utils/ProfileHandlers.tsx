// app/screens/ProfileHandlers.tsx
import { Router } from "expo-router";
import { Alert } from "react-native";
import { transactionData } from "../data/sampleData";

// Currency interface
interface Currency {
  code: string;
  name: string;
  symbol: string;
}

// Category interface
interface CategoryInfo {
  name: string;
  icon: string;
  color: string;
}

// List of available currencies
export const currencies: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "CLP", name: "Chilean Peso", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" }
];

// Cool colors palette (only cold colors - blues, greens, purples, teals)
const CATEGORY_COLORS = [
  "#3498db", // Azul claro - Primary cool color 1
  "#2ecc71", // Verde esmeralda - Primary cool color 2  
  "#9b59b6", // Púrpura - Primary cool color 3
  "#1abc9c", // Teal - Primary cool color 4
  "#2980b9", // Azul oscuro - Primary cool color 5
  "#27ae60", // Verde oscuro - Secondary cool color 6
  "#8e44ad", // Púrpura oscuro - Secondary cool color 7
  "#16a085", // Teal oscuro - Secondary cool color 8
  "#34495e", // Gris azulado - Secondary cool color 9
  "#5dade2"  // Azul suave - Secondary cool color 10
];

// Get unique categories from transactions with their icons and colors
export const getUniqueCategories = (): CategoryInfo[] => {
  const categories = [...new Set(transactionData.map(t => t.category))];
  return categories.map((category, index) => {
    let icon = "cube-outline";
    let color = CATEGORY_COLORS[index % CATEGORY_COLORS.length]; // Use cool colors cyclically
    
    switch (category.toLowerCase()) {
      case 'groceries':
        icon = "cart-outline";
        color = "#2ecc71"; // Verde esmeralda
        break;
      case 'rent':
        icon = "home-outline";
        color = "#3498db"; // Azul claro
        break;
      case 'bills':
        icon = "receipt-outline";
        color = "#9b59b6"; // Púrpura
        break;
      case 'transportation':
        icon = "car-outline";
        color = "#1abc9c"; // Teal
        break;
      case 'dining':
        icon = "restaurant-outline";
        color = "#2980b9"; // Azul oscuro
        break;
      case 'shopping':
        icon = "bag-outline";
        color = "#27ae60"; // Verde oscuro
        break;
      case 'healthcare':
        icon = "medical-outline";
        color = "#8e44ad"; // Púrpura oscuro
        break;
      case 'entertainment':
        icon = "film-outline";
        color = "#16a085"; // Teal oscuro
        break;
      case 'insurance':
        icon = "shield-outline";
        color = "#34495e"; // Gris azulado
        break;
      default:
        icon = "cube-outline";
        // Use the predefined cool color from the array for unknown categories
        break;
    }
    
    return { name: category, icon, color };
  });
};

// Function to handle Excel export (non-functional placeholder)
export const handleExportExcel = (): void => {
  Alert.alert(
    "Export to Excel",
    "This feature is coming soon. Would you like to be notified when it's available?",
    [
      { text: "No" },
      { 
        text: "Yes", 
        onPress: () => Alert.alert(
          "Thank you!", 
          "We'll notify you when this feature is available."
        ) 
      }
    ]
  );
};

// Function to navigate to Categories screen
export const handleCategoriesPress = (router: Router): void => {
  router.push("/screens/CategoriesScreen");
};

// Function to handle currency selection
export const handleCurrencySelect = (
  currency: string, 
  setSelectedCurrency: (currency: string) => void,
  setShowModal: (show: boolean) => void
): void => {
  setSelectedCurrency(currency);
  setShowModal(false);
};

// Function to get currency by code
export const getCurrencyByCode = (code: string): Currency | undefined => {
  return currencies.find(currency => currency.code === code);
};

// Function to format currency display
export const formatCurrencyDisplay = (
  selectedCurrency: string, 
  amount?: number
): string => {
  const currency = getCurrencyByCode(selectedCurrency);
  if (!currency) return `${amount || 0}`;
  
  if (amount !== undefined) {
    return `${currency.symbol}${amount.toFixed(2)}`;
  }
  
  return currency.symbol;
};

// Function to get stats summary
export const getStatsText = (stats: {
  cards: number;
  transactions: number;
  categories: number;
}): string => {
  return `You have ${stats.cards} cards, ${stats.transactions} transactions, and ${stats.categories} categories.`;
};

// Function to validate if all required data is available
export const validateProfileData = (): {
  isValid: boolean;
  message?: string;
} => {
  if (transactionData.length === 0) {
    return {
      isValid: false,
      message: "No transaction data available"
    };
  }
  
  const categories = getUniqueCategories();
  if (categories.length === 0) {
    return {
      isValid: false,
      message: "No categories found"
    };
  }
  
  return { isValid: true };
};

// Export default handlers for easy import
export default {
  getUniqueCategories,
  handleExportExcel,
  handleCategoriesPress,
  handleCurrencySelect,
  getCurrencyByCode,
  formatCurrencyDisplay,
  getStatsText,
  validateProfileData,
  currencies
};