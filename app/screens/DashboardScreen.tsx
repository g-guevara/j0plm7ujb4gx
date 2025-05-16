import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";
import { transactionData } from "../data/sampleData";

const SEGMENTS = ["D", "W", "M", "6M", "Y"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function DashboardScreen() {
  const [totalAmount, setTotalAmount] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState(transactionData.slice(0, 3));
  const [selectedSegment, setSelectedSegment] = useState(2); // M (Month) selected by default
  const [selectedFilter, setSelectedFilter] = useState("Debit");
  const [currentPeriod, setCurrentPeriod] = useState(new Date());
  const [categories, setCategories] = useState<{name: string, amount: number, color: string}[]>([]);

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
      "#e74c3c", // Red for Electronics
      "#9b59b6", // Purple for Bills
      "#2ecc71", // Green
      "#1abc9c", // Teal
      "#e67e22", // Dark Orange
      "#f1c40f"  // Yellow
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

  // Render donut chart
  const renderDonutChart = () => {
    const size = Dimensions.get("window").width * 0.7;
    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;
    
    // Calculate total for percentages
    const total = categories.reduce((sum, category) => sum + category.amount, 0);
    
    // Get the main category (highest amount)
    const mainCategory = categories.length > 0 ? categories[0] : null;
    
    // Create arcs for each category
    let startAngle = 0;
    const categoryArcs = categories.map((category, index) => {
      const percentage = category.amount / total;
      const sweepAngle = 2 * Math.PI * percentage;
      
      // Calculate path
      const x1 = center + radius * Math.cos(startAngle);
      const y1 = center + radius * Math.sin(startAngle);
      const x2 = center + radius * Math.cos(startAngle + sweepAngle);
      const y2 = center + radius * Math.sin(startAngle + sweepAngle);
      
      // Create path
      const largeArcFlag = sweepAngle > Math.PI ? 1 : 0;
      const path = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      
      const arc = (
        <Path
          key={index}
          d={path}
          fill={category.color}
          strokeWidth={0}
        />
      );
      
      startAngle += sweepAngle;
      return arc;
    });
    
    // Also create dot markers around the circle
    const dotMarkers = categories.map((category, index) => {
      const percentage = category.amount / total;
      const angle = 2 * Math.PI * (index / categories.length);
      
      const x = center + (radius - strokeWidth/2) * Math.cos(angle);
      const y = center + (radius - strokeWidth/2) * Math.sin(angle);
      
      return (
        <Circle
          key={`dot-${index}`}
          cx={x}
          cy={y}
          r={6}
          fill={category.color}
        />
      );
    });

    return (
      <View style={styles.donutChartContainer}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G>
            {/* Background circle */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#f2f2f2"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            
            {/* Main category colored arc */}
            {mainCategory && (
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={mainCategory.color}
                strokeWidth={strokeWidth}
                strokeDasharray={[circumference * 0.7, circumference]}
                strokeDashoffset={circumference * 0.25}
                fill="transparent"
              />
            )}
            
            {/* Category indicator dots */}
            {dotMarkers}
          </G>
        </Svg>
        
        {/* Center content */}
        <View style={styles.donutChartCenter}>
          <View style={[styles.categoryIcon, { backgroundColor: mainCategory?.color || "#f39c12" }]}>
            <Ionicons name="home-outline" size={24} color="white" />
          </View>
          <Text style={styles.donutChartAmount}>US${mainCategory ? mainCategory.amount.toFixed(0) : 0}</Text>
          <Text style={styles.donutChartLabel}>{mainCategory ? mainCategory.name.toUpperCase() : ""}</Text>
        </View>
      </View>
    );
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
      {renderDonutChart()}

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

// Helper function to get category icon
const getCategoryIcon = (category: string) => {
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
      iconName = "restaurant-outline";
      break;
    case 'shopping':
      iconName = "bag-outline";
      break;
    case 'healthcare':
      iconName = "medical-outline";
      break;
    default:
      iconName = "cube-outline";
      break;
  }
  
  return iconName as keyof typeof Ionicons.glyphMap;
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%', // Only cover the top 50% of the screen
    width: '100%',
  },
  container: {
    flex: 1,
    zIndex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 95,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 10,
  },
  // Segmented Control
  segmentedControlContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  segmentActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#888888",
  },
  segmentTextActive: {
    color: "#000000",
    fontWeight: "600",
  },
  // Filter and Period Navigation
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 24,
  },
  filterDropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterText: {
    fontSize: 16,
    fontWeight: "500",
    marginRight: 8,
  },
  periodNavigation: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
  },
  periodText: {
    fontSize: 16,
    fontWeight: "500",
    paddingHorizontal: 16,
  },
  // Donut Chart
  donutChartContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginTop: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 16,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  donutChartCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  donutChartAmount: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 8,
  },
  donutChartLabel: {
    fontSize: 12,
    color: "#888888",
    marginTop: 2,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f39c12",
    justifyContent: "center",
    alignItems: "center",
  },
  // Categories Tabs
  categoriesTabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 30,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
    backgroundColor: "#FFFFFF",
  },
  categoryTab: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#888888",
  },
  categoryTabActive: {
    color: "#000000",
  },
  // Categories List
  categoriesList: {
    marginTop: 8,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f39c12",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "500",
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
});