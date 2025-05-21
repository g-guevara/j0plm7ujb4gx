import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
  totalSpent, 
  totalBudget
}) => {
  // Early return for no data
  if (!categories || categories.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No budget data available</Text>
        </View>
      </View>
    );
  }

  const getProgressWidth = (spent: number, budget: number): number => {
    if (budget <= 0) return 0; // Prevent division by zero
    // Calculate percentage spent but cap at 100%
    const percentage = Math.min((spent / budget) * 100, 100);
    return percentage;
  };

  // Check if we need to show a total row at the top
  const showTotal = totalSpent !== undefined && totalBudget !== undefined && totalBudget > 0;

  return (
    <View style={styles.container}>
      {showTotal && (
        <View style={styles.categoryRow}>
          <View style={styles.categoryInfo}>
            <View style={styles.iconContainer}>
              <Ionicons name="stats-chart-outline" size={20} color="#888" />
            </View>
            <Text style={styles.categoryName}>All Expenses</Text>
          </View>
          
          <View style={styles.budgetInfo}>
            <Text style={styles.budgetText}>
              ${totalSpent.toLocaleString()} / ${totalBudget.toLocaleString()}
            </Text>
            
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${getProgressWidth(totalSpent, totalBudget)}%`, 
                    backgroundColor: '#9C56E8' 
                  } as any
                ]} 
              />
            </View>
          </View>
        </View>
      )}

      {categories.map((category, index) => (
        <View key={index} style={styles.categoryRow}>
          <View style={styles.categoryInfo}>
            <View style={[styles.iconContainer, { backgroundColor: `${category.color}20` }]}>
              <Ionicons name={category.icon as any} size={20} color={category.color} />
            </View>
            <Text style={styles.categoryName}>{category.name}</Text>
          </View>
          
          <View style={styles.budgetInfo}>
            <Text style={styles.budgetText}>
              ${category.spent.toLocaleString()} / ${category.budget.toLocaleString()}
            </Text>
            
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${getProgressWidth(category.spent, category.budget)}%`, 
                    backgroundColor: category.color 
                  } as any
                ]} 
              />
            </View>
          </View>
        </View>
      ))}
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