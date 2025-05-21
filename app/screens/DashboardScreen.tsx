import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";



import BudgetBarChart from "../components/dashboard/BudgetBarChart";


import ExpenseHistoryChart from "../components/dashboard/ExpenseHistoryChart";

import { DonutChart } from "../components/dashboard/DonutChart";


import { transactionData } from "../data/sampleData";

import { MONTHS, SEGMENTS, getCategoryIcon } from "../components/dashboard/DonutUtils";

import { styles } from "../styles/DashboardScreenStyles";


export default function DashboardScreen() {
  const router = useRouter();
  const [totalAmount, setTotalAmount] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState(transactionData.slice(0, 3));
  const [selectedSegment, setSelectedSegment] = useState(2); // M (Month) selected by default
  const [selectedFilter, setSelectedFilter] = useState("Debit");
  const [currentPeriod, setCurrentPeriod] = useState(new Date());
  const [categories, setCategories] = useState<{name: string, amount: number, color: string}[]>([]);
  
  // Sample data for the expense history chart
  const expenseHistoryData = [
    1200, 1250, 1300, 1280, 1350, 1400, 1450, 
    1500, 1520, 1580, 1600, 1650, 1700, 1750, 
    1850, 1900, 2000, 2100, 2200, 2300, 2400, 
    2500, 2700, 3000, 3500, 4000, 4466
  ];
  
  // Sample data for budget categories
  const budgetCategories = [
    {
      name: "Clothing & Shoes",
      spent: 145741,
      budget: 240000,
      icon: "shirt-outline",
      color: "#4CAF50"
    },
    {
      name: "Eating Out",
      spent: 118238,
      budget: 140000,
      icon: "restaurant-outline",
      color: "#2196F3"
    },
    {
      name: "Entertainment",
      spent: 84349,
      budget: 190000,
      icon: "game-controller-outline",
      color: "#F44336"
    }
  ];

  useEffect(() => {
    // Get current date/month for the time period display
    const now = new Date();
    setCurrentPeriod(now);

    // Calculate total amount across all transactions
    const total = transactionData.reduce((sum, transaction) => sum + transaction.mount, 0);
    setTotalAmount(total);

    // Get recent transactions (latest 5)
    const sorted = [...transactionData].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setRecentTransactions(sorted.slice(0, 5));

    // Calculate totals for each category
    const categoryMap = new Map<string, {amount: number, color: string}>();
    
    // Assign colors and calculate totals for each category
    const categoryColors = [
      "#f39c12", // Orange for Rent
      "#3498db", // Blue for Groceries
      "#e74c3c", // Red for Bills
      "#9b59b6", // Purple for Entertainment
      "#2ecc71", // Green for Transportation
      "#1abc9c", // Teal for Dining
      "#e67e22", // Dark Orange for Shopping
      "#f1c40f"  // Yellow for Healthcare
    ];
    
    transactionData.forEach(transaction => {
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
  }, []);

  // Format display of current period based on selected segment
  const getPeriodDisplay = () => {
    const segmentType = SEGMENTS[selectedSegment];
    
    switch (segmentType) {
      case "D":
        return currentPeriod.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      case "W":
        const startOfWeek = new Date(currentPeriod);
        startOfWeek.setDate(currentPeriod.getDate() - currentPeriod.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      case "M":
        return MONTHS[currentPeriod.getMonth()];
      case "6M":
        const startMonth = new Date(currentPeriod);
        startMonth.setMonth(currentPeriod.getMonth() - 5);
        return `${startMonth.toLocaleDateString("en-US", { month: "short" })} - ${currentPeriod.toLocaleDateString("en-US", { month: "short" })}`;
      case "Y":
        return currentPeriod.getFullYear().toString();
      default:
        return MONTHS[currentPeriod.getMonth()];
    }
  };

  // Navigate to previous/next period
  const navigatePeriod = (direction: "prev" | "next") => {
    const newPeriod = new Date(currentPeriod);
    const segmentType = SEGMENTS[selectedSegment];
    
    switch (segmentType) {
      case "D":
        newPeriod.setDate(newPeriod.getDate() + (direction === "next" ? 1 : -1));
        break;
      case "W":
        newPeriod.setDate(newPeriod.getDate() + (direction === "next" ? 7 : -7));
        break;
      case "M":
        newPeriod.setMonth(newPeriod.getMonth() + (direction === "next" ? 1 : -1));
        break;
      case "6M":
        newPeriod.setMonth(newPeriod.getMonth() + (direction === "next" ? 6 : -6));
        break;
      case "Y":
        newPeriod.setFullYear(newPeriod.getFullYear() + (direction === "next" ? 1 : -1));
        break;
    }
    
    setCurrentPeriod(newPeriod);
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
          <View style={styles.filterDropdown}>
            <Text style={styles.filterText}>{selectedFilter}</Text>
            <Ionicons name="chevron-down" size={16} color="#333" />
          </View>

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

        {/* Donut Chart */}
        <DonutChart categories={categories} />
        
        {/* Expense History Chart */}
        <ExpenseHistoryChart data={expenseHistoryData} amount={4466} budget={5000} />
        
        {/* Budget Bar Chart */}
        <BudgetBarChart
          categories={budgetCategories}
          totalSpent={1509376}
          totalBudget={2800000}
        />

        {/* Categories Tabs */}
        <View style={styles.categoriesTabContainer}>
          <TouchableOpacity style={styles.categoryTab}>
            <Text style={[styles.categoryTabText, styles.categoryTabActive]}>HEAD CATEGORIES</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryTab}>
            <Text style={styles.categoryTabText}>CATEGORIES</Text>
          </TouchableOpacity>
        </View>

        {/* Categories List */}
        <View style={styles.categoriesList}>
          {categories.slice(0, 4).map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <View style={styles.categoryLeft}>
                <View style={[styles.categoryIndicator, { backgroundColor: category.color }]}>
                  <Ionicons 
                    name={getCategoryIcon(category.name)} 
                    size={18} 
                    color="#FFFFFF" 
                  />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </View>
              <Text style={styles.categoryAmount}>US${category.amount.toFixed(0)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}