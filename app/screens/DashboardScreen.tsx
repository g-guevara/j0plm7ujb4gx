import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import CardFilterDropdown from "../components/dashboard/CardFilterDropdown"; // Import the new component

import BudgetBarChart from "../components/dashboard/BudgetBarChart";
import { DonutChart } from "../components/dashboard/DonutChart";
import { getCategoryIcon, SEGMENTS } from "../components/dashboard/DonutUtils";
import ExpenseHistoryChart from "../components/dashboard/ExpenseHistoryChart";
import { Transaction, transactionData } from "../data/sampleData";
import { styles } from "../styles/DashboardScreenStyles";

// Define budget values for categories (we'll use these since we don't have actual budget data)
const CATEGORY_BUDGETS: Record<string, number> = {
  "Groceries": 240000,
  "Rent": 600000,
  "Bills": 190000,
  "Entertainment": 120000,
  "Transportation": 140000,
  "Dining": 150000,
  "Shopping": 200000,
  "Healthcare": 100000,
};

// Default budget for categories without specific budget
const DEFAULT_BUDGET = 100000;

export default function DashboardScreen() {
  const router = useRouter();
  const [selectedSegment, setSelectedSegment] = useState(2); // M (Month) selected by default
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null); // New state for card selection
  const [currentPeriod, setCurrentPeriod] = useState(new Date());
  const [categories, setCategories] = useState<{name: string, amount: number, color: string}[]>([]);
  const [expenseHistory, setExpenseHistory] = useState<number[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [budgetCategories, setBudgetCategories] = useState<{
    name: string;
    spent: number;
    budget: number;
    icon: string;
    color: string;
  }[]>([]);
  
  // Category colors
  const categoryColors = [
    "#f39c12", // Orange
    "#3498db", // Blue
    "#e74c3c", // Red
    "#9b59b6", // Purple
    "#2ecc71", // Green
    "#1abc9c", // Teal
    "#e67e22", // Dark Orange
    "#f1c40f"  // Yellow
  ];

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
      setCategories([]);
      setExpenseHistory([]);
      setBudgetCategories([]);
    }
  }, [filteredTransactions]);

  // Reprocess data when segment or period changes
  useEffect(() => {
    if (filteredTransactions.length > 0) {
      // Process historical data for ExpenseHistoryChart based on selected segment
      processHistoricalData(filteredTransactions);
    }
  }, [selectedSegment, currentPeriod]);

  // Group transactions by category for DonutChart
  const processCategoryData = (transactions: Transaction[]) => {
    const categoryMap = new Map<string, {amount: number, color: string}>();
    
    // Group transactions by category and sum amounts
    transactions.forEach(transaction => {
      if (!categoryMap.has(transaction.category)) {
        const colorIndex = categoryMap.size % categoryColors.length;
        categoryMap.set(transaction.category, {
          amount: 0,
          color: categoryColors[colorIndex]
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
  };

  // Process transactions into time series data for ExpenseHistoryChart
  const processHistoricalData = (transactions: Transaction[]) => {
    // Sort transactions by date
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Get the current segment type
    const segmentType = SEGMENTS[selectedSegment];
    const now = new Date(currentPeriod);
    
    // Initialize appropriate data structure based on segment type
    let chartData: number[] = [];
    
    switch(segmentType) {
      case "D": // Day - hourly data (24 hours)
        // Initialize with zeros for each hour (0-23)
        chartData = Array(24).fill(0);
        
        // Sum transactions by hour for the current day
        sortedTransactions.forEach(transaction => {
          const date = new Date(transaction.date);
          // Check if transaction is from the selected day
          if (date.getDate() === now.getDate() && 
              date.getMonth() === now.getMonth() && 
              date.getFullYear() === now.getFullYear()) {
            const hour = date.getHours();
            chartData[hour] += transaction.mount;
          }
        });
        
        // Calculate cumulative sums for running total
        let runningDayTotal = 0;
        chartData = chartData.map(amount => {
          runningDayTotal += amount;
          return runningDayTotal;
        });
        break;
        
      case "W": // Week - daily data (7 days)
        // Initialize with zeros for each day of the week (0-6, Sunday-Saturday)
        chartData = Array(7).fill(0);
        
        // Get the start of the week (Sunday)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        
        // Sum transactions by day for the current week
        sortedTransactions.forEach(transaction => {
          const date = new Date(transaction.date);
          // Check if transaction is within the selected week
          const dayDiff = Math.floor((date.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24));
          if (dayDiff >= 0 && dayDiff < 7) {
            const dayOfWeek = date.getDay();
            chartData[dayOfWeek] += transaction.mount;
          }
        });
        
        // Calculate cumulative sums for running total
        let runningWeekTotal = 0;
        chartData = chartData.map(amount => {
          runningWeekTotal += amount;
          return runningWeekTotal;
        });
        break;
        
      case "M": // Month - daily data (up to 31 days)
        // Get days in current month
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        
        // Initialize with zeros for each day
        chartData = Array(daysInMonth).fill(0);
        
        // Sum transactions by day for the current month
        sortedTransactions.forEach(transaction => {
          const date = new Date(transaction.date);
          // Check if transaction is from the selected month
          if (date.getMonth() === now.getMonth() && 
              date.getFullYear() === now.getFullYear()) {
            const day = date.getDate() - 1; // 0-indexed
            chartData[day] += transaction.mount;
          }
        });
        
        // Calculate cumulative sums for running total
        let runningMonthTotal = 0;
        chartData = chartData.map(amount => {
          runningMonthTotal += amount;
          return runningMonthTotal;
        });
        break;
        
      case "6M": // 6 Months - monthly data (6 months)
        // Initialize with zeros for each month (0-5)
        chartData = Array(6).fill(0);
        
        // Calculate start month (5 months before current)
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(now.getMonth() - 5);
        const startMonth = sixMonthsAgo.getMonth();
        const startYear = sixMonthsAgo.getFullYear();
        
        // Sum transactions by month for the last 6 months
        sortedTransactions.forEach(transaction => {
          const date = new Date(transaction.date);
          const transYear = date.getFullYear();
          const transMonth = date.getMonth();
          
          // Calculate months difference
          const monthDiff = (transYear - startYear) * 12 + (transMonth - startMonth);
          
          if (monthDiff >= 0 && monthDiff < 6) {
            chartData[monthDiff] += transaction.mount;
          }
        });
        
        // Calculate cumulative sums for running total
        let runningSixMonthTotal = 0;
        chartData = chartData.map(amount => {
          runningSixMonthTotal += amount;
          return runningSixMonthTotal;
        });
        break;
        
      case "Y": // Year - monthly data (12 months)
        // Initialize with zeros for each month (0-11)
        chartData = Array(12).fill(0);
        
        // Sum transactions by month for the current year
        sortedTransactions.forEach(transaction => {
          const date = new Date(transaction.date);
          // Check if transaction is from the selected year
          if (date.getFullYear() === now.getFullYear()) {
            const month = date.getMonth();
            chartData[month] += transaction.mount;
          }
        });
        
        // Calculate cumulative sums for running total
        let runningYearTotal = 0;
        chartData = chartData.map(amount => {
          runningYearTotal += amount;
          return runningYearTotal;
        });
        break;
        
      default:
        // Fallback to month view if segment is not recognized
        const defaultDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        chartData = Array(defaultDaysInMonth).fill(0);
        
        sortedTransactions.forEach(transaction => {
          const date = new Date(transaction.date);
          if (date.getMonth() === now.getMonth() && 
              date.getFullYear() === now.getFullYear()) {
            const day = date.getDate() - 1;
            chartData[day] += transaction.mount;
          }
        });
        
        let defaultRunningTotal = 0;
        chartData = chartData.map(amount => {
          defaultRunningTotal += amount;
          return defaultRunningTotal;
        });
        break;
    }
    
    setExpenseHistory(chartData);
  };

  // Process budget data for BudgetBarChart
  const processBudgetData = (transactions: Transaction[]) => {
    const categorySpending = new Map<string, number>();
    
    // Sum spending by category
    transactions.forEach(transaction => {
      const current = categorySpending.get(transaction.category) || 0;
      categorySpending.set(transaction.category, current + transaction.mount);
    });
    
    // Create budget categories array
    const budgetCats = Array.from(categorySpending.entries())
      .map(([name, spent], index) => {
        // Get appropriate icon for the category
        const iconName = getCategoryIcon(name);
        // Get budget for this category (or use default)
        const budget = CATEGORY_BUDGETS[name] || DEFAULT_BUDGET;
        // Get color from the category colors array
        const colorIndex = index % categoryColors.length;
        
        return {
          name,
          spent,
          budget,
          icon: iconName,
          color: categoryColors[colorIndex]
        };
      })
      // Sort by highest spending first
      .sort((a, b) => b.spent - a.spent)
      // Take top 3 categories
      .slice(0, 3);
    
    setBudgetCategories(budgetCats);
  };

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

  // Calculate total budget across all categories
  const totalBudget = budgetCategories.reduce((sum, category) => sum + category.budget, 0);

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
            <Svg viewBox="0 0 24 24" width={36} height={36} fill="white">
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
        
        {/* Expense History Chart */}
        {expenseHistory.length > 0 ? (
          <ExpenseHistoryChart 
            data={expenseHistory} 
            amount={totalSpent} 
            budget={totalBudget} 
            timeSegment={SEGMENTS[selectedSegment]} // Pass the current segment
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
            totalBudget={totalBudget}
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