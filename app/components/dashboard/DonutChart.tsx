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
  // New prop to set the minimum percentage threshold (default 2%)
  minPercentThreshold?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ 
  categories,
  minPercentThreshold = 2 
}) => {
  // Early validation - check if categories exist and have valid data
  const validCategories = categories?.filter(cat => 
    cat && 
    typeof cat.name === 'string' && 
    cat.name.trim() !== '' &&
    typeof cat.amount === 'number' && 
    !isNaN(cat.amount) &&
    cat.amount > 0  // Only include positive values
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
  const padding = strokeWidth; // Add padding equal to stroke width
  const radius = (size - strokeWidth - padding) / 2;
  const center = size / 2;
  
  // Calculate total amount
  const totalAmount = validCategories.reduce((sum, category) => sum + category.amount, 0);
  
  // Pre-defined colors for the segments if color is not provided
  const defaultColors = [
    "#9c56e8", // Purple
    "#4a9bea", // Blue
    "#f27ab1", // Pink
    "#f8a427", // Orange
    "#2ecc71", // Green
    "#e74c3c", // Red
    "#34495e"  // Dark blue
  ];
  
  // Create separate segments with fixed gaps between them
  const createSegments = () => {
    // The fixed gap in degrees between segments
    const gapAngleDegrees = 12;
    
    // Sort categories by amount (descending) for better visual display
    const sortedCategories = [...validCategories].sort((a, b) => b.amount - a.amount);
    
    // Filter out categories below threshold (just hide them completely)
    const filteredCategories = sortedCategories.filter(category => {
      const proportion = category.amount / totalAmount;
      const percentageOfTotal = proportion * 100;
      return percentageOfTotal >= minPercentThreshold;
    });
    
    // Calculate adjusted angles to account for gaps
    const totalGapAngle = gapAngleDegrees * filteredCategories.length;
    const availableAngle = 360 - totalGapAngle;
    
    let segments = [];
    let startAngle = -90 - (gapAngleDegrees / 2); // Start at top, offset by half a gap
    
    // Process only the filtered categories
    for (let i = 0; i < filteredCategories.length; i++) {
      const category = filteredCategories[i];
      const proportion = category.amount / totalAmount;
      const segmentAngle = proportion * availableAngle;
      const color = category.color || defaultColors[i % defaultColors.length];
      
      // Add gap by advancing the start angle
      startAngle += gapAngleDegrees / 2;
      
      // Create segment
      segments.push({
        category,
        startAngle: startAngle,
        endAngle: startAngle + segmentAngle,
        color
      });
      
      // Advance to next segment position (adding half gap at the end)
      startAngle += segmentAngle + (gapAngleDegrees / 2);
    }
    
    return segments;
  };
  
  const segments = createSegments();

  // Define the glow filter IDs
  const glowFilterIds = segments.map((_, i) => `glow-${i}`);
  
  // Render all segments
  const renderSegments = () => {
    return segments.map((segment, index) => {
      // Convert to radians
      const startRad = (segment.startAngle * Math.PI) / 180;
      const endRad = (segment.endAngle * Math.PI) / 180;
      
      // The angular span in degrees
      const spanDegrees = segment.endAngle - segment.startAngle;
      
      // For larger segments (>120 degrees), split into smaller arcs for better visual
      if (spanDegrees > 120) {
        const numArcs = Math.ceil(spanDegrees / 60);
        const arcs = [];
        
        for (let i = 0; i < numArcs; i++) {
          const arcStartDegree = segment.startAngle + (i * spanDegrees / numArcs);
          const arcEndDegree = segment.startAngle + ((i + 1) * spanDegrees / numArcs);
          
          // Subtract 1 degree from end of each sub-arc to create mini-gaps
          const adjustedEndDegree = i < numArcs - 1 
            ? arcEndDegree - 1 
            : arcEndDegree;
            
          const arcStartRad = (arcStartDegree * Math.PI) / 180;
          const arcEndRad = (adjustedEndDegree * Math.PI) / 180;
          
          // Determine if we need the large-arc-flag
          const largeArcFlag = (adjustedEndDegree - arcStartDegree) > 180 ? 1 : 0;
          
          arcs.push(
            <Path
              key={`arc-${index}-${i}`}
              d={`
                M ${center + radius * Math.cos(arcStartRad)} ${center + radius * Math.sin(arcStartRad)}
                A ${radius} ${radius} 0 ${largeArcFlag} 1 ${center + radius * Math.cos(arcEndRad)} ${center + radius * Math.sin(arcEndRad)}
              `}
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="transparent"
              filter={`url(#${glowFilterIds[index]})`}
            />
          );
        }
        return arcs;
      } else {
        // Determine if we need the large-arc-flag
        const largeArcFlag = spanDegrees > 180 ? 1 : 0;
        
        return (
          <Path
            key={`segment-${index}`}
            d={`
              M ${center + radius * Math.cos(startRad)} ${center + radius * Math.sin(startRad)}
              A ${radius} ${radius} 0 ${largeArcFlag} 1 ${center + radius * Math.cos(endRad)} ${center + radius * Math.sin(endRad)}
            `}
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            filter={`url(#${glowFilterIds[index]})`}
          />
        );
      }
    });
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
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
          {/* Define glow filters for each segment */}
          <Defs>
            {segments.map((segment, index) => (
              <Filter id={glowFilterIds[index]} key={`filter-${index}`} x="-50%" y="-50%" width="200%" height="200%">
                <FeGaussianBlur stdDeviation="3" result="blur" />
                <FeColorMatrix
                  in="blur"
                  type="matrix"
                  values="0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.8 0 0 0 1 0"
                  result="glow"
                />
                <FeComposite in="SourceGraphic" in2="glow" operator="over" />
              </Filter>
            ))}
          </Defs>
          
          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#fff"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Render all segments */}
          <G>
            {renderSegments()}
          </G>
        </Svg>
        
        {/* Center content */}
        <View style={styles.donutChartCenter}>
          <View style={[styles.categoryIcon, { backgroundColor: mainCategory.color || defaultColors[0] }]}>
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
              <View style={[styles.categoryIndicator, { backgroundColor: category.color || defaultColors[index % defaultColors.length] }]}>
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