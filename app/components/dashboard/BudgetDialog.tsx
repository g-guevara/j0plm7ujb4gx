import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

interface BudgetItem {
  name: string;
  budget: number;
  percentage?: number;
  color: string;
  icon: string;
}

interface BudgetDialogProps {
  visible: boolean;
  onClose: () => void;
  onSave: (budgets: BudgetItem[], usePercentage: boolean, totalBudget: number) => void;
  initialBudgets: BudgetItem[];
  initialUsePercentage: boolean;
  initialTotalBudget: number;
}

export const BudgetDialog: React.FC<BudgetDialogProps> = ({
  visible,
  onClose,
  onSave,
  initialBudgets,
  initialUsePercentage,
  initialTotalBudget
}) => {
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [usePercentage, setUsePercentage] = useState(initialUsePercentage);
  const [totalBudget, setTotalBudget] = useState(initialTotalBudget.toString());
  
  // Initialize state when modal opens
  useEffect(() => {
    if (visible) {
      setBudgets([...initialBudgets]);
      setUsePercentage(initialUsePercentage);
      setTotalBudget(initialTotalBudget.toString());
    }
  }, [visible, initialBudgets, initialUsePercentage, initialTotalBudget]);

  // Update budget for a category
  const updateBudget = (index: number, value: string) => {
    const newBudgets = [...budgets];
    
    // If using percentage, validate that it's between 0-100
    if (usePercentage) {
      const numValue = Number(value);
      if (numValue < 0 || numValue > 100) return;
      
      newBudgets[index] = {
        ...newBudgets[index],
        percentage: numValue,
        budget: (numValue / 100) * Number(totalBudget)
      };
    } else {
      // Direct budget value
      const numValue = Number(value);
      if (numValue < 0) return;
      
      newBudgets[index] = {
        ...newBudgets[index],
        budget: numValue,
        // Also update percentage for internal tracking
        percentage: Number(totalBudget) > 0 ? (numValue / Number(totalBudget)) * 100 : 0
      };
    }
    
    setBudgets(newBudgets);
  };

  // Update total budget
  const updateTotalBudget = (value: string) => {
    // Validate it's a positive number
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0) return;
    
    setTotalBudget(value);
    
    // Update all budgets proportionally when using percentages
    if (usePercentage) {
      const newBudgets = budgets.map(budget => ({
        ...budget,
        budget: (budget.percentage || 0) / 100 * numValue
      }));
      setBudgets(newBudgets);
    }
  };

  // Toggle between percentage and absolute amount
  const toggleUsePercentage = () => {
    const newUsePercentage = !usePercentage;
    setUsePercentage(newUsePercentage);
    
    // Recalculate values based on new mode
    const totalBudgetNum = Number(totalBudget);
    
    if (newUsePercentage) {
      // Convert absolute to percentage
      const newBudgets = budgets.map(budget => ({
        ...budget,
        percentage: totalBudgetNum > 0 ? (budget.budget / totalBudgetNum) * 100 : 0
      }));
      setBudgets(newBudgets);
    } else {
      // Make sure percentages are properly applied to absolute values
      const newBudgets = budgets.map(budget => ({
        ...budget,
        budget: ((budget.percentage || 0) / 100) * totalBudgetNum
      }));
      setBudgets(newBudgets);
    }
  };

  // Validate and save budget settings
  const handleSave = () => {
    // Validate total budget
    const totalBudgetNum = Number(totalBudget);
    if (isNaN(totalBudgetNum) || totalBudgetNum <= 0) {
      Alert.alert("Invalid Budget", "Please enter a valid total budget amount.");
      return;
    }
    
    // When using percentages, validate they sum close to 100%
    if (usePercentage) {
      const totalPercentage = budgets.reduce((sum, item) => sum + (item.percentage || 0), 0);
      if (totalPercentage < 99 || totalPercentage > 101) {
        Alert.alert(
          "Invalid Percentages", 
          `The sum of all percentages should be close to 100%. Current total: ${totalPercentage.toFixed(1)}%`
        );
        return;
      }
    }
    
    // Save changes
    onSave(budgets, usePercentage, totalBudgetNum);
  };

  // Format numbers for display
  const formatCurrency = (value: number): string => {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Render each budget item
  const renderBudgetItem = ({ item, index }: { item: BudgetItem; index: number }) => (
    <View style={styles.budgetItem}>
      <View style={styles.categoryInfo}>
        <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon as any} size={20} color="white" />
        </View>
        <Text style={styles.categoryName}>{item.name}</Text>
      </View>
      
      <View style={styles.budgetInputContainer}>
        {usePercentage ? (
          <View style={styles.percentageInput}>
            <TextInput
              style={styles.input}
              value={item.percentage?.toString() || "0"}
              onChangeText={(value) => updateBudget(index, value)}
              keyboardType="numeric"
              maxLength={5}
            />
            <Text style={styles.percentSign}>%</Text>
          </View>
        ) : (
          <View style={styles.absoluteInput}>
            <Text style={styles.currencySign}>$</Text>
            <TextInput
              style={styles.input}
              value={formatCurrency(item.budget)}
              onChangeText={(value) => updateBudget(index, value.replace(/,/g, ''))}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
        )}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Budget Limits</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Budget Type Toggle */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>
              Use Percentage
            </Text>
            <Switch
              value={usePercentage}
              onValueChange={toggleUsePercentage}
              trackColor={{ false: "#d0d0d0", true: "#a0c4ff" }}
              thumbColor={usePercentage ? "#3498db" : "#f4f3f4"}
            />
          </View>
          
          {/* Total Budget Input - Only show when not using percentage */}
          {!usePercentage && (
            <View style={styles.totalBudgetContainer}>
              <Text style={styles.sectionTitle}>Total Budget</Text>
              <View style={styles.totalBudgetInput}>
                <Text style={styles.currencySign}>$</Text>
                <TextInput
                  style={styles.totalInput}
                  value={formatCurrency(Number(totalBudget))}
                  onChangeText={(value) => updateTotalBudget(value.replace(/,/g, ''))}
                  keyboardType="numeric"
                  placeholder="Enter total budget"
                />
              </View>
            </View>
          )}

          <Text style={styles.sectionTitle}>Category Budgets</Text>
          
          {/* Budget Items List */}
          <FlatList
            data={budgets}
            renderItem={renderBudgetItem}
            keyExtractor={(item) => item.name}
            contentContainerStyle={styles.budgetList}
          />

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={[styles.buttonText, styles.saveButtonText]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    marginTop: 5,
  },
  totalBudgetContainer: {
    marginBottom: 20,
  },
  totalBudgetInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  totalInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  currencySign: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginRight: 4,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 8,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  budgetList: {
    paddingBottom: 10,
  },
  budgetItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  budgetInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 100,
  },
  percentageInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  absoluteInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  input: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    minWidth: 60,
    textAlign: "right",
  },
  percentSign: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  saveButton: {
    backgroundColor: "#3498db",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonText: {
    color: "white",
  },
});

export default BudgetDialog;