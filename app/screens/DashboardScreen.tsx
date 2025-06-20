import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import BudgetBarChart from "../components/dashboard/BudgetBarChart";
import CardFilterDropdown from "../components/dashboard/CardFilterDropdown";
import { DonutChart } from "../components/dashboard/DonutChart";
import { SEGMENTS } from "../components/dashboard/DonutUtils";
import ExpenseHistoryChart from "../components/dashboard/ExpenseHistoryChart";
import { Transaction, transactionData } from "../data/sampleData";
import { getAllCategories } from "../services/storage";
import { styles } from "../styles/DashboardScreenStyles";

export default function DashboardScreen() {
  const router = useRouter();
  const [selectedSegment, setSelectedSegment] = useState(2); // M (Month) selected by default
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null); // New state for card selection
  const [currentPeriod, setCurrentPeriod] = useState(new Date());
  const [categories, setCategories] = useState<{name: string, amount: number, color: string}[]>([]);
  
  // Updated state for expense and income tracking
  const [expenseHistory, setExpenseHistory] = useState<number[]>([]);
  const [incomeHistory, setIncomeHistory] = useState<number[]>([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  
  const [totalSpent, setTotalSpent] = useState(0);
  const [budgetCategories, setBudgetCategories] = useState<{
    name: string;
    spent: number;
    budget: number;
    icon: string;
    color: string;
  }[]>([]);

  // Get user categories from storage (memoized to prevent infinite loop)
  const userCategories = useMemo(() => getAllCategories(), []);

  // Helper function to get category data by name
  const getCategoryData = useMemo(() => (categoryName: string) => {
    const userCategory = userCategories.find(
      cat => cat.name.toLowerCase() === categoryName.toLowerCase()
    );
    
    if (userCategory) {
      return {
        color: userCategory.color,
        icon: userCategory.icon
      };
    }
    
    // Fallback for categories not found in user storage
    return {
      color: "#007aff", // Default blue
      icon: "cube-outline" // Default icon
    };
  }, [userCategories]);

  // Filter transactions based on selected time period and card
  const filteredTransactions = useMemo(() => {
    const segmentType = SEGMENTS[selectedSegment];
    const now = new Date(currentPeriod);
    
    let filtered = transactionData.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      
      // Time period filter
      let matchesTimePeriod = false;
      switch (segmentType) {
        case "D": // Day
          matchesTimePeriod = transactionDate.getDate() === now.getDate() &&
                 transactionDate.getMonth() === now.getMonth() &&
                 transactionDate.getFullYear() === now.getFullYear();
          break;
        case "W": // Week
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          matchesTimePeriod = transactionDate >= startOfWeek && transactionDate <= endOfWeek;
          break;
        case "M": // Month
          matchesTimePeriod = transactionDate.getMonth() === now.getMonth() &&
                 transactionDate.getFullYear() === now.getFullYear();
          break;
        case "6M": // 6 Months
          const sixMonthsAgo = new Date(now);
          sixMonthsAgo.setMonth(now.getMonth() - 5);
          matchesTimePeriod = transactionDate >= sixMonthsAgo && transactionDate <= now;
          break;
        case "Y": // Year
          matchesTimePeriod = transactionDate.getFullYear() === now.getFullYear();
          break;
        default:
          matchesTimePeriod = true;
          break;
      }
      
      // Card filter
      const matchesCard = selectedCardId === null || selectedCardId === 0 || 
                          transaction.cardId === selectedCardId;
      
      return matchesTimePeriod && matchesCard;
    });
    
    return filtered;
  }, [selectedSegment, currentPeriod, selectedCardId, transactionData]);

  // Group transactions by category for DonutChart
  const processCategoryData = useCallback((transactions: Transaction[]) => {
    const categoryMap = new Map<string, {amount: number, color: string}>();
    
    // Group transactions by category and sum amounts
    transactions.forEach(transaction => {
      if (!categoryMap.has(transaction.category)) {
        // Get real category data from user storage
        const categoryData = getCategoryData(transaction.category);
        
        categoryMap.set(transaction.category, {
          amount: 0,
          color: categoryData.color
        });
      }
      
      const category = categoryMap.get(transaction.category)!;
      category.amount += transaction.mount;
      categoryMap.set(transaction.category, category);
    });
    
    // Convert map to array for rendering
    const categoryArray = Array.from(categoryMap.entries()).map(([name, { amount, color }]) => ({
      name,
      amount,
      color
    }));
    
    // Sort by amount (largest first)
    categoryArray.sort((a, b) => b.amount - a.amount);
    
    setCategories(categoryArray);
  }, [getCategoryData]);

  // Process transactions into time series data for ExpenseHistoryChart
  const processHistoricalData = useCallback((transactions: Transaction[]) => {
    // Sort transactions by date
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Get the current segment type
    const segmentType = SEGMENTS[selectedSegment];
    const now = new Date(currentPeriod);
    
    // Initialize structures for both expense and income data
    let expenseData: number[] = [];
    let incomeData: number[] = [];
    let totalExpenseAmount = 0;
    let totalIncomeAmount = 0;
    
    // Function to determine if transaction is expense or income
    // Note: In this example, we're assuming positive mount values are expenses
    // and negative mount values are income. Adjust this logic if your data is different.
    const isExpense = (mount: number) => mount >= 0;
    
    switch(segmentType) {
      case "D": // Day - hourly data (24 hours)
        // Initialize with zeros for each hour (0-23)
        expenseData = Array(24).fill(0);
        incomeData = Array(24).fill(0);
        
        // Process transactions by hour for the current day
        sortedTransactions.forEach(transaction => {
          const date = new Date(transaction.date);
          // Check if transaction is from the selected day
          if (date.getDate() === now.getDate() && 
              date.getMonth() === now.getMonth() && 
              date.getFullYear() === now.getFullYear()) {
            
            const hour = date.getHours();
            const mount = Math.abs(transaction.mount); // Use absolute value for calculations
            
            if (isExpense(transaction.mount)) {
              expenseData[hour] += mount;
              totalExpenseAmount += mount;
            } else {
              incomeData[hour] += mount;
              totalIncomeAmount += mount;
            }
          }
        });
        
        // Calculate cumulative sums for each dataset
        let runningExpenseTotal = 0;
        let runningIncomeTotal = 0;
        
        expenseData = expenseData.map(amount => {
          runningExpenseTotal += amount;
          return runningExpenseTotal;
        });
        
        incomeData = incomeData.map(amount => {
          runningIncomeTotal += amount;
          return runningIncomeTotal;
        });
        break;
        
      case "W": // Week - daily data (7 days)
        // Initialize with zeros for each day of the week (0-6, Sunday-Saturday)
        expenseData = Array(7).fill(0);
        incomeData = Array(7).fill(0);
        
        // Get the start of the week (Sunday)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        
        // Process transactions by day for the current week
        sortedTransactions.forEach(transaction => {
          const date = new Date(transaction.date);
          // Check if transaction is within the selected week
          const dayDiff = Math.floor((date.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24));
          if (dayDiff >= 0 && dayDiff < 7) {
            const dayOfWeek = date.getDay();
            const mount = Math.abs(transaction.mount);
            
            if (isExpense(transaction.mount)) {
              expenseData[dayOfWeek] += mount;
              totalExpenseAmount += mount;
            } else {
              incomeData[dayOfWeek] += mount;
              totalIncomeAmount += mount;
            }
          }
        });
        
        // Calculate cumulative sums
        let runningWeekExpenseTotal = 0;
        let runningWeekIncomeTotal = 0;
        
        expenseData = expenseData.map(amount => {
          runningWeekExpenseTotal += amount;
          return runningWeekExpenseTotal;
        });
        
        incomeData = incomeData.map(amount => {
          runningWeekIncomeTotal += amount;
          return runningWeekIncomeTotal;
        });
        break;
        
      case "M": // Month - daily data (up to 31 days)
        // Get days in current month
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        
        // Initialize with zeros for each day
        expenseData = Array(daysInMonth).fill(0);
        incomeData = Array(daysInMonth).fill(0);
        
        // Process transactions by day for the current month
        sortedTransactions.forEach(transaction => {
          const date = new Date(transaction.date);
          // Check if transaction is from the selected month
          if (date.getMonth() === now.getMonth() && 
              date.getFullYear() === now.getFullYear()) {
            const day = date.getDate() - 1; // 0-indexed
            const mount = Math.abs(transaction.mount);
            
            if (isExpense(transaction.mount)) {
              expenseData[day] += mount;
              totalExpenseAmount += mount;
            } else {
              incomeData[day] += mount;
              totalIncomeAmount += mount;
            }
          }
        });
        
        // Calculate cumulative sums
        let runningMonthExpenseTotal = 0;
        let runningMonthIncomeTotal = 0;
        
        expenseData = expenseData.map(amount => {
          runningMonthExpenseTotal += amount;
          return runningMonthExpenseTotal;
        });
        
        incomeData = incomeData.map(amount => {
          runningMonthIncomeTotal += amount;
          return runningMonthIncomeTotal;
        });
        break;
        
      case "6M": // 6 Months - monthly data (6 months)
        // Initialize with zeros for each month (0-5)
        expenseData = Array(6).fill(0);
        incomeData = Array(6).fill(0);
        
        // Calculate start month (5 months before current)
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(now.getMonth() - 5);
        const startMonth = sixMonthsAgo.getMonth();
        const startYear = sixMonthsAgo.getFullYear();
        
        // Process transactions by month for the last 6 months
        sortedTransactions.forEach(transaction => {
          const date = new Date(transaction.date);
          const transYear = date.getFullYear();
          const transMonth = date.getMonth();
          
          // Calculate months difference
          const monthDiff = (transYear - startYear) * 12 + (transMonth - startMonth);
          
          if (monthDiff >= 0 && monthDiff < 6) {
            const mount = Math.abs(transaction.mount);
            
            if (isExpense(transaction.mount)) {
              expenseData[monthDiff] += mount;
              totalExpenseAmount += mount;
            } else {
              incomeData[monthDiff] += mount;
              totalIncomeAmount += mount;
            }
          }
        });
        
        // Calculate cumulative sums
        let runningSixMonthExpenseTotal = 0;
        let runningSixMonthIncomeTotal = 0;
        
        expenseData = expenseData.map(amount => {
          runningSixMonthExpenseTotal += amount;
          return runningSixMonthExpenseTotal;
        });
        
        incomeData = incomeData.map(amount => {
          runningSixMonthIncomeTotal += amount;
          return runningSixMonthIncomeTotal;
        });
        break;
        
      case "Y": // Year - monthly data (12 months)
        // Initialize with zeros for each month (0-11)
        expenseData = Array(12).fill(0);
        incomeData = Array(12).fill(0);
        
        // Process transactions by month for the current year
        sortedTransactions.forEach(transaction => {
          const date = new Date(transaction.date);
          // Check if transaction is from the selected year
          if (date.getFullYear() === now.getFullYear()) {
            const month = date.getMonth();
            const mount = Math.abs(transaction.mount);
            
            if (isExpense(transaction.mount)) {
              expenseData[month] += mount;
              totalExpenseAmount += mount;
            } else {
              incomeData[month] += mount;
              totalIncomeAmount += mount;
            }
          }
        });
        
        // Calculate cumulative sums
        let runningYearExpenseTotal = 0;
        let runningYearIncomeTotal = 0;
        
        expenseData = expenseData.map(amount => {
          runningYearExpenseTotal += amount;
          return runningYearExpenseTotal;
        });
        
        incomeData = incomeData.map(amount => {
          runningYearIncomeTotal += amount;
          return runningYearIncomeTotal;
        });
        break;
        
      default:
        // Fallback to month view if segment is not recognized
        const defaultDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        expenseData = Array(defaultDaysInMonth).fill(0);
        incomeData = Array(defaultDaysInMonth).fill(0);
        
        sortedTransactions.forEach(transaction => {
          const date = new Date(transaction.date);
          if (date.getMonth() === now.getMonth() && 
              date.getFullYear() === now.getFullYear()) {
            const day = date.getDate() - 1;
            const mount = Math.abs(transaction.mount);
            
            if (isExpense(transaction.mount)) {
              expenseData[day] += mount;
              totalExpenseAmount += mount;
            } else {
              incomeData[day] += mount;
              totalIncomeAmount += mount;
            }
          }
        });
        
        let defaultRunningExpenseTotal = 0;
        let defaultRunningIncomeTotal = 0;
        
        expenseData = expenseData.map(amount => {
          defaultRunningExpenseTotal += amount;
          return defaultRunningExpenseTotal;
        });
        
        incomeData = incomeData.map(amount => {
          defaultRunningIncomeTotal += amount;
          return defaultRunningIncomeTotal;
        });
        break;
    }
    
    // Update state with processed data
    setExpenseHistory(expenseData);
    setIncomeHistory(incomeData);
    setTotalExpense(totalExpenseAmount);
    setTotalIncome(totalIncomeAmount);
  }, [selectedSegment, currentPeriod]);

  // Process budget data for BudgetBarChart
  const processBudgetData = useCallback((transactions: Transaction[]) => {
    const categorySpending = new Map<string, number>();
    
    // Sum spending by category
    transactions.forEach(transaction => {
      const current = categorySpending.get(transaction.category) || 0;
      categorySpending.set(transaction.category, current + transaction.mount);
    });
    
    // Create budget categories array using real category data
    const budgetCats = Array.from(categorySpending.entries())
      .map(([name, spent]) => {
        // Get real category data from user storage
        const categoryData = getCategoryData(name);
        
        return {
          name,
          spent,
          budget: 100000, // default value, will be overridden by the component
          icon: categoryData.icon,
          color: categoryData.color
        };
      })
      // Sort by highest spending first
      .sort((a, b) => b.spent - a.spent)
      // Take top 3 categories
      .slice(0, 3);
    
    setBudgetCategories(budgetCats);
  }, [getCategoryData]);

  // Process transaction data when filtered transactions change
  useEffect(() => {
    if (filteredTransactions.length > 0) {
      // Calculate total amount
      const total = filteredTransactions.reduce((sum, transaction) => sum + transaction.mount, 0);
      setTotalSpent(total);

      // Process category data for DonutChart
      processCategoryData(filteredTransactions);
      
      // Process historical data for ExpenseHistoryChart
      processHistoricalData(filteredTransactions);
      
      // Process budget data for BudgetBarChart
      processBudgetData(filteredTransactions);
    } else {
      // Reset charts if no data
      setTotalSpent(0);
      setTotalExpense(0);
      setTotalIncome(0);
      setCategories([]);
      setExpenseHistory([]);
      setIncomeHistory([]);
      setBudgetCategories([]);
    }
  }, [filteredTransactions, processCategoryData, processHistoricalData, processBudgetData]);

  // Format display of current period based on selected segment
  const getPeriodDisplay = (): string => {
    const segmentType = SEGMENTS[selectedSegment];
    const now = new Date(currentPeriod);
    
    switch (segmentType) {
      case "D": // Day
        return now.toLocaleDateString('en-US', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        });
      case "W": // Week
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        return `${startOfWeek.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      case "M": // Month
        return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case "6M": // 6 Months
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(now.getMonth() - 5);
        
        return `${sixMonthsAgo.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
      case "Y": // Year
        return now.getFullYear().toString();
      default:
        return "All Time";
    }
  };

  // Navigate to previous/next period
  const navigatePeriod = (direction: "prev" | "next") => {
    const segmentType = SEGMENTS[selectedSegment];
    const newPeriod = new Date(currentPeriod);
    
    switch (segmentType) {
      case "D": // Day
        newPeriod.setDate(newPeriod.getDate() + (direction === "next" ? 1 : -1));
        break;
      case "W": // Week
        newPeriod.setDate(newPeriod.getDate() + (direction === "next" ? 7 : -7));
        break;
      case "M": // Month
        newPeriod.setMonth(newPeriod.getMonth() + (direction === "next" ? 1 : -1));
        break;
      case "6M": // 6 Months
        newPeriod.setMonth(newPeriod.getMonth() + (direction === "next" ? 6 : -6));
        break;
      case "Y": // Year
        newPeriod.setFullYear(newPeriod.getFullYear() + (direction === "next" ? 1 : -1));
        break;
    }
    
    setCurrentPeriod(newPeriod);
  };

  // Handle card selection from dropdown
  const handleCardSelect = (cardId: number) => {
    setSelectedCardId(cardId);
  };

  return (
    <View style={styles.mainContainer}>
      {/* Background Image - only at the top */}
      <Image
        source={require('../../assets/images/dashboard-bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      <StatusBar barStyle="dark-content" />
      
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <TouchableOpacity 
            onPress={() => router.push("/screens/ProfileScreen")}
            style={styles.profileIcon}
          >
            <Svg viewBox="0 0 24 24" width={36} height={36} fill="black">
              <Path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Segmented Control */}
        <View style={styles.segmentedControlContainer}>
          <View style={styles.segmentedControl}>
            {SEGMENTS.map((segment, index) => (
              <TouchableOpacity
                key={segment}
                style={[
                  styles.segment,
                  selectedSegment === index ? styles.segmentActive : null
                ]}
                onPress={() => setSelectedSegment(index)}
              >
                <Text style={[
                  styles.segmentText,
                  selectedSegment === index ? styles.segmentTextActive : null
                ]}>
                  {segment}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Filter and Period Navigation */}
        <View style={styles.filterContainer}>
          {/* Replace the old filter dropdown with our new CardFilterDropdown */}
          <CardFilterDropdown
            selectedCardId={selectedCardId}
            onCardSelect={handleCardSelect}
          />

          <View style={styles.periodNavigation}>
            <TouchableOpacity onPress={() => navigatePeriod("prev")}>
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            
            <Text style={styles.periodText}>{getPeriodDisplay()}</Text>
            
            <TouchableOpacity onPress={() => navigatePeriod("next")}>
              <Ionicons name="chevron-forward" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Donut Chart with Categories */}
        {categories.length > 0 ? (
          <DonutChart categories={categories} />
        ) : (
          <View style={styles.donutChartContainer}>
            <Text>{"No transaction data available for this period"}</Text>
          </View>
        )}
        
        {/* Expense History Chart - Updated to use dual-line chart */}
        {(expenseHistory.length > 0 || incomeHistory.length > 0) ? (
          <ExpenseHistoryChart 
            expenseData={expenseHistory} 
            incomeData={incomeHistory}
            totalExpense={totalExpense}
            totalIncome={totalIncome}
            timeSegment={SEGMENTS[selectedSegment]}
          />
        ) : (
          <View style={[styles.donutChartContainer, { marginTop: 16 }]}>
            <Text>{"No expense history available for this period"}</Text>
          </View>
        )}
        
        {/* Budget Bar Chart */}
        {budgetCategories.length > 0 ? (
          <BudgetBarChart
            categories={budgetCategories}
            totalSpent={totalSpent}
          />
        ) : (
          <View style={[styles.donutChartContainer, { marginTop: 16, marginBottom: 16 }]}>
            <Text>{"No budget data available for this period"}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}