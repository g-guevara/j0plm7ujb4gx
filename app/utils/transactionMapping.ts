import AsyncStorage from '@react-native-async-storage/async-storage';

// Key for storing transaction mappings
const TRANSACTION_MAPPINGS_KEY = 'transaction_name_mappings';

// Interface for transaction mappings
interface TransactionMapping {
  originalName: string;
  customName: string;
  customCategory: string;
}

/**
 * Save a mapping between original transaction name and custom name/category
 */
export const saveTransactionMapping = async (
  originalName: string, 
  customName: string, 
  customCategory: string
): Promise<boolean> => {
  try {
    // Normalize the original name (lowercase, trim, remove special characters)
    const normalizedOriginal = normalizeTransactionName(originalName);
    
    if (!normalizedOriginal || !customName || !customCategory) {
      console.error('Invalid mapping data');
      return false;
    }
    
    // Get existing mappings
    const mappings = await getTransactionMappings();
    
    // Check if this mapping already exists
    const existingIndex = mappings.findIndex(
      m => normalizeTransactionName(m.originalName) === normalizedOriginal
    );
    
    if (existingIndex >= 0) {
      // Update existing mapping
      mappings[existingIndex] = {
        originalName: normalizedOriginal,
        customName,
        customCategory
      };
    } else {
      // Add new mapping
      mappings.push({
        originalName: normalizedOriginal,
        customName,
        customCategory
      });
    }
    
    // Save updated mappings
    await AsyncStorage.setItem(TRANSACTION_MAPPINGS_KEY, JSON.stringify(mappings));
    console.log(`Saved mapping: ${normalizedOriginal} → ${customName} (${customCategory})`);
    return true;
  } catch (error) {
    console.error('Error saving transaction mapping:', error);
    return false;
  }
};

/**
 * Get all transaction mappings
 */
export const getTransactionMappings = async (): Promise<TransactionMapping[]> => {
  try {
    const mappingsJson = await AsyncStorage.getItem(TRANSACTION_MAPPINGS_KEY);
    return mappingsJson ? JSON.parse(mappingsJson) : [];
  } catch (error) {
    console.error('Error getting transaction mappings:', error);
    return [];
  }
};

/**
 * Find a mapping for a transaction name
 */
export const findTransactionMapping = async (transactionName: string): Promise<TransactionMapping | null> => {
  try {
    const normalizedName = normalizeTransactionName(transactionName);
    const mappings = await getTransactionMappings();
    
    // Try to find a match
    const mapping = mappings.find(m => {
      const normalizedMapping = normalizeTransactionName(m.originalName);
      return normalizedName === normalizedMapping || 
             normalizedName.includes(normalizedMapping) || 
             normalizedMapping.includes(normalizedName);
    });
    
    return mapping || null;
  } catch (error) {
    console.error('Error finding transaction mapping:', error);
    return null;
  }
};

/**
 * Apply transaction mappings to a transaction object
 */
export const applyTransactionMapping = async (transaction: {
  name: string;
  category: string;
}): Promise<{
  name: string;
  category: string;
  wasModified: boolean;
}> => {
  try {
    const mapping = await findTransactionMapping(transaction.name);
    
    if (mapping) {
      console.log(`Applied mapping for "${transaction.name}": ${mapping.customName} (${mapping.customCategory})`);
      return {
        name: mapping.customName,
        category: mapping.customCategory,
        wasModified: true
      };
    }
    
    return {
      ...transaction,
      wasModified: false
    };
  } catch (error) {
    console.error('Error applying transaction mapping:', error);
    return {
      ...transaction,
      wasModified: false
    };
  }
};

/**
 * Normalize a transaction name for better matching
 */
export const normalizeTransactionName = (name: string): string => {
  if (!name) return '';
  
  // Convert to lowercase, trim spaces, and remove special characters
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ');   // Replace multiple spaces with single space
};

/**
 * Clear all transaction mappings (for testing/debugging)
 */
export const clearAllMappings = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TRANSACTION_MAPPINGS_KEY);
    console.log('Cleared all transaction mappings');
  } catch (error) {
    console.error('Error clearing transaction mappings:', error);
  }
};