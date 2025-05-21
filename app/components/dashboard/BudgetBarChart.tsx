import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BudgetDialog from './BudgetDialog';

// Default budget value (only used when no budget is set)
const DEFAULT_BUDGET = 100000;

interface CategoryBudget {
  name: string;
  spent: number;
  budget: number;
  icon: string;
  color: string;
}

interface BudgetBarChartProps {
  categories: CategoryBudget[];
  totalSpent?: number;
  totalBudget?: number;
}

export const BudgetBarChart: React.FC<BudgetBarChartProps> = ({ 
  categories, 
  totalSpent
}) => {
  // Local state for budget management
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>({});
  const [usePercentageBudget, setUsePercentageBudget] = useState(false);
  const [totalBudget, setTotalBudget] = useState(1500000); // Default $1.5M total budget
  
  // Save budget changes from the dialog
  const handleSaveBudget = (
    budgetItems: Array<{name: string; budget: number; percentage?: number; color: string; icon: string}>,
    usePercentage: boolean,
    newTotalBudget: number
  ) => {
    // Update the total budget
    setTotalBudget(newTotalBudget);
    
    // Update the use percentage flag
    setUsePercentageBudget(usePercentage);
    
    // Convert budget items to budget object
    const newBudgets: Record<string, number> = {};
    budgetItems.forEach(item => {
      newBudgets[item.name] = item.budget;
    });
    
    // Update the category budgets
    setCategoryBudgets(newBudgets);
    
    // Close the dialog
    setShowBudgetDialog(false);
  };

  // Validate data thoroughly
  const validCategories = categories?.filter(cat => 
    cat && 
    typeof cat.name === 'string' && 
    typeof cat.spent === 'number' && !isNaN(cat.spent) &&
    typeof cat.budget === 'number' && !isNaN(cat.budget) &&
    cat.budget > 0 && // Ensure we don't divide by zero
    typeof cat.icon === 'string' &&
    typeof cat.color === 'string'
  ) || [];
  
  // Validate total values
  const validTotalSpent = typeof totalSpent === 'number' && !isNaN(totalSpent) ? totalSpent : 0;
  
  // Early return for no data
  if (!validCategories || validCategories.length === 0) {
    return (
      <View style={styles.container}>
        {/* Title and Edit Button - Always display even with no data */}
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Budget</Text>
          <TouchableOpacity style={styles.editButton} onPress={() => setShowBudgetDialog(true)}>
            <Ionicons name="pencil-outline" size={20} color="#3498db" />
          </TouchableOpacity>
        </View>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No budget data available</Text>
        </View>

        {/* Budget Dialog */}
        <BudgetDialog
          visible={showBudgetDialog}
          onClose={() => setShowBudgetDialog(false)}
          onSave={handleSaveBudget}
          initialBudgets={[]}
          initialUsePercentage={usePercentageBudget}
          initialTotalBudget={totalBudget}
        />
      </View>
    );
  }

  const getProgressWidth = (spent: number, budget: number): number => {
    if (budget <= 0) return 0; // Prevent division by zero
    
    // Safety check for NaN values
    if (isNaN(spent) || isNaN(budget)) return 0;
    
    // Calculate percentage spent but cap at 100%
    const percentage = Math.min((spent / budget) * 100, 100);
    
    // Additional safety check
    return isFinite(percentage) ? percentage : 0;
  };

  // Format currency safely
  const formatCurrency = (value: number): string => {
    if (typeof value !== 'number' || isNaN(value)) return "$0";
    return "$" + value.toLocaleString();
  };

  // Get budget for a category (from local state if available, otherwise use the provided budget)
  const getCategoryBudget = (category: CategoryBudget): number => {
    return categoryBudgets[category.name] || category.budget || DEFAULT_BUDGET;
  };

  // Recalculate total budget based on individual categories
  const calculatedTotalBudget = usePercentageBudget ? totalBudget : validCategories.reduce(
    (sum, cat) => sum + getCategoryBudget(cat), 0
  );

  return (
    <View style={styles.container}>
      {/* Title and Edit Button */}
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>Budget</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => setShowBudgetDialog(true)}>
          <Ionicons name="pencil-outline" size={20} color="#3498db" />
        </TouchableOpacity>
      </View>
      
      {/* Display total row only when not using percentage */}
      {!usePercentageBudget && (
        <View style={styles.categoryRow}>
          <View style={styles.categoryInfo}>
            <View style={styles.iconContainer}>
              <Ionicons name="stats-chart-outline" size={20} color="#888" />
            </View>
            <Text style={styles.categoryName}>All Expenses</Text>
          </View>
          
          <View style={styles.budgetInfo}>
            <Text style={styles.budgetText}>
              {formatCurrency(validTotalSpent)} / {formatCurrency(calculatedTotalBudget)}
            </Text>
            
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${getProgressWidth(validTotalSpent, calculatedTotalBudget)}%`, 
                    backgroundColor: '#9C56E8' 
                  } as any
                ]} 
              />
            </View>
          </View>
        </View>
      )}

      {validCategories.map((category, index) => {
        const categoryBudget = getCategoryBudget(category);
        return (
          <View key={index} style={styles.categoryRow}>
            <View style={styles.categoryInfo}>
              <View style={[styles.iconContainer, { backgroundColor: `${category.color}20` }]}>
                <Ionicons 
                  name={(category.icon as any) || "help-circle-outline"} 
                  size={20} 
                  color={category.color} 
                />
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
            </View>
            
            <View style={styles.budgetInfo}>
              <Text style={styles.budgetText}>
                {formatCurrency(category.spent)} {usePercentageBudget ? 
                  `(${((category.spent / validTotalSpent) * 100).toFixed(0)}%)` : 
                  `/ ${formatCurrency(categoryBudget)}`}
              </Text>
              
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${getProgressWidth(category.spent, categoryBudget)}%`, 
                      backgroundColor: category.color 
                    } as any
                  ]} 
                />
              </View>
            </View>
          </View>
        );
      })}

      {/* Budget Dialog */}
      <BudgetDialog
        visible={showBudgetDialog}
        onClose={() => setShowBudgetDialog(false)}
        onSave={handleSaveBudget}
        initialBudgets={validCategories.map(cat => ({
          name: cat.name,
          budget: getCategoryBudget(cat),
          percentage: usePercentageBudget ? (getCategoryBudget(cat) / totalBudget) * 100 : undefined,
          color: cat.color,
          icon: cat.icon
        }))}
        initialUsePercentage={usePercentageBudget}
        initialTotalBudget={totalBudget}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16, // Added bottom margin
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryRow: {
    marginBottom: 24,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  budgetInfo: {
    marginLeft: 48,
  },
  budgetText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#EEEEEE',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  noDataContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  }
});

export default BudgetBarChart;