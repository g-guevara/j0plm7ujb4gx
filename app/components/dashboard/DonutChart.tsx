import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, {
    Circle,
    Defs,
    FeColorMatrix,
    FeComposite,
    FeGaussianBlur,
    Filter,
    G,
    Path
} from "react-native-svg";

import { getCategoryIcon } from "./DonutUtils";

interface DonutChartProps {
  categories: {
    name: string;
    amount: number;
    color: string;
  }[];
}

export const DonutChart: React.FC<DonutChartProps> = ({ categories }) => {
  // Early validation - check if categories exist and have valid data
  const validCategories = categories?.filter(cat => 
    cat && 
    typeof cat.name === 'string' && 
    cat.name.trim() !== '' &&
    typeof cat.amount === 'number' && 
    !isNaN(cat.amount)
  ) || [];
  
  // If no valid categories, show "no data" message
  if (validCategories.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.chartSection}>
          <Text style={styles.noDataText}>No transaction data available</Text>
        </View>
      </View>
    );
  }

  const size = Dimensions.get("window").width * 0.7;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  
  // Pre-defined colors that match the reference image
  const pillColors = [
    "#9c56e8", // Purple
    "#4a9bea", // Blue
    "#f27ab1", // Pink
    "#f8a427", // Orange
    "#4a9bea", // Blue
  ];
  
  // Define pill-shaped segments with their positions - positioned to avoid overlap
  const renderPillSegments = () => {
    const segments: React.ReactNode[] = [];
    
    // Define the glow filter ID for each color
    const glowFilterIds = pillColors.map((color, i) => `glow-${i}`);
    
    // Each segment is defined by starting and ending angle and a length
    // Angles are in degrees, where 0 is at the top and angle increases clockwise
    const segmentDefinitions = [
      { startAngle: -10, length: 60, color: pillColors[0], glowColor: "#9c56e8", glowId: glowFilterIds[0] },  // Purple top-left
      { startAngle: 70, length: 60, color: pillColors[1], glowColor: "#4a9bea", glowId: glowFilterIds[1] },   // Blue top-right
      { startAngle: 150, length: 45, color: pillColors[2], glowColor: "#f27ab1", glowId: glowFilterIds[2] },  // Pink right
      { startAngle: 215, length: 50, color: pillColors[3], glowColor: "#f8a427", glowId: glowFilterIds[3] },  // Orange bottom-right
      { startAngle: 285, length: 60, color: pillColors[1], glowColor: "#4a9bea", glowId: glowFilterIds[4] },  // Blue bottom-left
    ];
    
    // Create the pill segments
    segmentDefinitions.forEach((segment, index) => {
      const startAngleDeg = segment.startAngle;
      const endAngleDeg = startAngleDeg + segment.length;
      
      // Convert to radians
      const startAngle = (startAngleDeg * Math.PI) / 180;
      const endAngle = (endAngleDeg * Math.PI) / 180;
      
      segments.push(
        <Path
          key={`segment-${index}`}
          d={`
            M ${center + radius * Math.cos(startAngle)} ${center + radius * Math.sin(startAngle)}
            A ${radius} ${radius} 0 0 1 ${center + radius * Math.cos(endAngle)} ${center + radius * Math.sin(endAngle)}
          `}
          stroke={segment.color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          filter={`url(#${segment.glowId})`}
        />
      );
    });
    
    return segments;
  };

  // Get the main category (highest spending)
  const mainCategory = validCategories.length > 0 ? validCategories[0] : null;

  // Only proceed if we have a main category
  if (!mainCategory) {
    return (
      <View style={styles.container}>
        <View style={styles.chartSection}>
          <Text style={styles.noDataText}>No transaction data available</Text>
        </View>
      </View>
    );
  }

  // Safely format currency amount
  const formatAmount = (amount: number): string => {
    if (isNaN(amount)) return "$0";
    return "$" + amount.toFixed(0);
  };

  return (
    <View style={styles.container}>
      {/* Donut Chart Part */}
      <View style={styles.chartSection}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Define glow filters for each color */}
          <Defs>
            {/* Purple glow filter */}
            <Filter id="glow-0" x="-50%" y="-50%" width="200%" height="200%">
              <FeGaussianBlur stdDeviation="3" result="blur" />
              <FeColorMatrix
                in="blur"
                type="matrix"
                values="0 0 0 0 0.612 0 0 0 0 0.337 0 0 0 0 0.91 0 0 0 1 0"
                result="glow"
              />
              <FeComposite in="SourceGraphic" in2="glow" operator="over" />
            </Filter>
            
            {/* Blue glow filter */}
            <Filter id="glow-1" x="-50%" y="-50%" width="200%" height="200%">
              <FeGaussianBlur stdDeviation="3" result="blur" />
              <FeColorMatrix
                in="blur"
                type="matrix"
                values="0 0 0 0 0.29 0 0 0 0 0.608 0 0 0 0 0.918 0 0 0 1 0"
                result="glow"
              />
              <FeComposite in="SourceGraphic" in2="glow" operator="over" />
            </Filter>
            
            {/* Pink glow filter */}
            <Filter id="glow-2" x="-50%" y="-50%" width="200%" height="200%">
              <FeGaussianBlur stdDeviation="3" result="blur" />
              <FeColorMatrix
                in="blur"
                type="matrix"
                values="0 0 0 0 0.949 0 0 0 0 0.478 0 0 0 0 0.694 0 0 0 1 0"
                result="glow"
              />
              <FeComposite in="SourceGraphic" in2="glow" operator="over" />
            </Filter>
            
            {/* Orange glow filter */}
            <Filter id="glow-3" x="-50%" y="-50%" width="200%" height="200%">
              <FeGaussianBlur stdDeviation="4" result="blur" />
              <FeColorMatrix
                in="blur"
                type="matrix"
                values="0 0 0 0 0.973 0 0 0 0 0.643 0 0 0 0 0.153 0 0 0 1 0"
                result="glow"
              />
              <FeComposite in="SourceGraphic" in2="glow" operator="over" />
            </Filter>
            
            {/* Blue glow filter (bottom) */}
            <Filter id="glow-4" x="-50%" y="-50%" width="200%" height="200%">
              <FeGaussianBlur stdDeviation="3" result="blur" />
              <FeColorMatrix
                in="blur"
                type="matrix"
                values="0 0 0 0 0.29 0 0 0 0 0.608 0 0 0 0 0.918 0 0 0 1 0"
                result="glow"
              />
              <FeComposite in="SourceGraphic" in2="glow" operator="over" />
            </Filter>
          </Defs>
          
          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#f2f2f2"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Render all pill segments */}
          <G>
            {renderPillSegments()}
          </G>
        </Svg>
        
        {/* Center content */}
        <View style={styles.donutChartCenter}>
          <View style={[styles.categoryIcon, { backgroundColor: mainCategory.color }]}>
            <Ionicons 
              name={getCategoryIcon(mainCategory.name)}
              size={22} 
              color="white" 
            />
          </View>
          <Text style={styles.donutChartAmount}>
            {formatAmount(mainCategory.amount)}
          </Text>
          <Text style={styles.donutChartLabel}>
            {mainCategory.name.toUpperCase()}
          </Text>
        </View>
      </View>

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
        {validCategories.slice(0, 4).map((category, index) => (
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
            <Text style={styles.categoryAmount}>${!isNaN(category.amount) ? category.amount.toFixed(0) : "0"}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  chartSection: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 20,
  },
  donutChartCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutChartAmount: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
    color: '#222222',
  },
  donutChartLabel: {
    fontSize: 14,
    color: '#888888',
    marginTop: 2,
    fontWeight: '500',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8a427',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Categories Tabs
  categoriesTabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    backgroundColor: '#FFFFFF',
  },
  categoryTab: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#888888',
  },
  categoryTabActive: {
    color: '#000000',
  },
  // Categories List
  categoriesList: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f39c12',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  noDataText: {
    fontSize: 16,
    color: '#888',
    padding: 40,
    textAlign: 'center',
  }
});

export default DonutChart;