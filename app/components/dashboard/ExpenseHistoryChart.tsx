import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

// Define view modes as enum
type ViewMode = 'ALL' | 'EXPENSES' | 'INCOME';

interface ExpenseHistoryChartProps {
  expenseData: number[]; // Expenses (positive values)
  incomeData?: number[]; // Income (positive values) 
  budget?: number;
  title?: string;
  totalExpense?: number;
  totalIncome?: number;
  timeSegment?: string;
}

export const ExpenseHistoryChart: React.FC<ExpenseHistoryChartProps> = ({ 
  expenseData, 
  incomeData = [], 
  budget = 5000, 
  title,
  totalExpense = 0,
  totalIncome = 0,
  timeSegment = "M" // Default to Month
}) => {
  // Add state to track the current view mode
  const [viewMode, setViewMode] = useState<ViewMode>('ALL');
  
  // Validate input data thoroughly
  const validExpenseData = expenseData?.filter(value => typeof value === 'number' && !isNaN(value)) || [];
  const validIncomeData = incomeData?.filter(value => typeof value === 'number' && !isNaN(value)) || [];
  const validTotalExpense = typeof totalExpense === 'number' && !isNaN(totalExpense) ? totalExpense : 0;
  const validTotalIncome = typeof totalIncome === 'number' && !isNaN(totalIncome) ? totalIncome : 0;
  const validBudget = typeof budget === 'number' && !isNaN(budget) ? budget : 5000;
  
  // Calculate net amount (income - expense)
  const netAmount = validTotalIncome - validTotalExpense;
  
  // Generate title based on timeSegment
  const getChartTitle = () => {
    if (title) return title; // Use provided title if available
    
    switch(timeSegment) {
      case "D":
        return "SPENT TODAY";
      case "W":
        return "SPENT THIS WEEK";
      case "M":
        return "SPENT THIS MONTH";
      case "6M":
        return "SPENT LAST 6 MONTHS";
      case "Y":
        return "SPENT THIS YEAR";
      default:
        return "SPEND HISTOGRAM";
    }
  };
  
  // Early return if no valid data
  if ((validExpenseData.length === 0 && validIncomeData.length === 0)) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{getChartTitle()}</Text>
        <Text style={styles.amount}>$0</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No expense or income data for this period</Text>
        </View>
      </View>
    );
  }

  const width = Dimensions.get('window').width - 32; // Full width minus padding
  const height = 180;
  const paddingTop = 30;
  const paddingBottom = 40;
  const paddingLeft = 20;
  const paddingRight = 40; // Increased padding on the right
  
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  
  // Calculate max value for scaling (with fallback)
  const allValues = [...validExpenseData, ...validIncomeData];
  let maxValue = Math.max(...allValues, validBudget) * 1.1; // 10% headroom
  if (!isFinite(maxValue) || maxValue <= 0) maxValue = 1000; // Fallback value if calculation fails
  
  // Get x-axis labels based on timeSegment
  const getXAxisLabels = () => {
    switch(timeSegment) {
      case "D":
        return ["12am", "4am", "8am", "12pm", "4pm", "8pm", "11pm"]; // Hours
      case "W":
        return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; // Days of week
      case "M":
        return [1, 7, 14, 21, 28, 31]; // Days of month
      case "6M": {
        // Get month names for the last 6 months
        const now = new Date();
        const labels = [];
        for (let i = 5; i >= 0; i--) {
          const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
          labels.push(month.toLocaleDateString('en-US', { month: 'short' }));
        }
        return labels;
      }
      case "Y": {
        // Month abbreviations
        return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      }
      default:
        return [1, 7, 14, 21, 28, 31]; // Default to days of month
    }
  };

  const xAxisLabels = getXAxisLabels();
  
  // Function to create chart points 
  const createChartPoints = (data: number[]) => {
    // Ensure the data has at least 2 points for a line
    if (data.length < 2) {
      return [];
    }
    
    // Generate chart points with safety checks
    return data.map((value, index) => {
      // Ensure values are numbers and not NaN
      const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
      const x = paddingLeft + (index / Math.max(data.length - 1, 1)) * chartWidth;
      const y = paddingTop + chartHeight - (safeValue / maxValue) * chartHeight;
      return { x, y };
    });
  };
  
  // Generate points for both lines
  const expensePoints = createChartPoints(validExpenseData);
  const incomePoints = createChartPoints(validIncomeData);
  
  // Generate paths for the lines
  const createLinePath = (points: { x: number, y: number }[]) => {
    if (points.length < 2) return "";
    
    return points.map((point, i) => 
      i === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
    ).join(' ');
  };
  
  const expenseLinePath = createLinePath(expensePoints);
  const incomeLinePath = createLinePath(incomePoints);
  
  // Generate area below the expense line for gradient fill
  const createAreaPath = (points: { x: number, y: number }[]) => {
    if (points.length < 2) return "";
    
    return `${createLinePath(points)} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
  };
  
  const expenseAreaPath = createAreaPath(expensePoints);
  const incomeAreaPath = createAreaPath(incomePoints);

  // Safe formatter for currency
  const formatCurrency = (value: number): string => {
    if (typeof value !== 'number' || isNaN(value)) return "$0";
    
    const isNegative = value < 0;
    const formattedValue = "$" + Math.abs(value).toLocaleString('en-US', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    });
    
    return isNegative ? `-${formattedValue}` : formattedValue;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{getChartTitle()}</Text>
      <Text style={[
        styles.amount, 
        netAmount < 0 ? styles.negativeAmount : styles.positiveAmount
      ]}>
        {netAmount < 0 ? '-' : ''}{formatCurrency(Math.abs(netAmount))}
      </Text>
      
      {/* Elegant Segmented Control */}
      <View style={styles.segmentedControlWrapper}>
        <View style={styles.segmentedControl}>
          <TouchableOpacity 
            style={[
              styles.segment,
              viewMode === 'ALL' && styles.activeSegment
            ]}
            onPress={() => setViewMode('ALL')}
          >
            <Text style={[
              styles.segmentText,
              viewMode === 'ALL' && styles.activeSegmentText
            ]}>All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.segment,
              viewMode === 'EXPENSES' && styles.activeSegment
            ]}
            onPress={() => setViewMode('EXPENSES')}
          >
            <View style={styles.segmentContent}>
              <Text style={[
                styles.segmentText,
                viewMode === 'EXPENSES' && styles.activeSegmentText
              ]}>Expenses:</Text>
              <Text style={[
                styles.amountText,
                viewMode === 'EXPENSES' ? styles.activeSegmentText : styles.expenseAmountText
              ]}>{formatCurrency(validTotalExpense)}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.segment,
              viewMode === 'INCOME' && styles.activeSegment
            ]}
            onPress={() => setViewMode('INCOME')}
          >
            <View style={styles.segmentContent}>
              <Text style={[
                styles.segmentText,
                viewMode === 'INCOME' && styles.activeSegmentText
              ]}>Income:</Text>
              <Text style={[
                styles.amountText,
                viewMode === 'INCOME' ? styles.activeSegmentText : styles.incomeAmountText
              ]}>{formatCurrency(validTotalIncome)}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#E74C3C" stopOpacity={0.3} />
            <Stop offset="1" stopColor="#E74C3C" stopOpacity={0} />
          </LinearGradient>
          <LinearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#007aff" stopOpacity={0.3} />
            <Stop offset="1" stopColor="#007aff" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        
        {/* Grid lines */}
        <Line 
          x1={paddingLeft} 
          y1={paddingTop + chartHeight} 
          x2={paddingLeft + chartWidth} 
          y2={paddingTop + chartHeight} 
          stroke="#EEEEEE" 
          strokeWidth={1} 
        />
        
        {/* Area fills with gradients - conditionally rendered based on viewMode */}
        {(viewMode === 'ALL' || viewMode === 'EXPENSES') && expensePoints.length >= 2 && (
          <Path
            d={expenseAreaPath}
            fill="url(#expenseGradient)"
          />
        )}
        
        {(viewMode === 'ALL' || viewMode === 'INCOME') && incomePoints.length >= 2 && (
          <Path
            d={incomeAreaPath}
            fill="url(#incomeGradient)"
          />
        )}
        
        {/* Main lines - conditionally rendered based on viewMode */}
        {(viewMode === 'ALL' || viewMode === 'EXPENSES') && expensePoints.length >= 2 && (
          <Path
            d={expenseLinePath}
            stroke="#E74C3C"
            strokeWidth={3}
            fill="none"
          />
        )}
        
        {(viewMode === 'ALL' || viewMode === 'INCOME') && incomePoints.length >= 2 && (
          <Path
            d={incomeLinePath}
            stroke="#007aff"
            strokeWidth={3}
            fill="none"
          />
        )}
        
        {/* Last points with dots - conditionally rendered based on viewMode */}
        {(viewMode === 'ALL' || viewMode === 'EXPENSES') && expensePoints.length >= 2 && (
          <Circle
            cx={expensePoints[expensePoints.length - 1].x}
            cy={expensePoints[expensePoints.length - 1].y}
            r={6}
            fill="#E74C3C"
            stroke="white"
            strokeWidth={2}
          />
        )}
        
        {(viewMode === 'ALL' || viewMode === 'INCOME') && incomePoints.length >= 2 && (
          <Circle
            cx={incomePoints[incomePoints.length - 1].x}
            cy={incomePoints[incomePoints.length - 1].y}
            r={6}
            fill="#007aff"
            stroke="white"
            strokeWidth={2}
          />
        )}
        
        {/* X-axis labels */}
        {xAxisLabels.map((label, index) => {
          // Calculate label positions to spread them evenly
          const x = paddingLeft + (chartWidth / (xAxisLabels.length - 1)) * index;
          return (
            <SvgText
              key={index}
              x={x}
              y={height - 10}
              textAnchor="middle"
              fontSize={12}
              fill="#999999"
            >
              {label}
            </SvgText>
          );
        })}
      </Svg>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 4,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 12,
  },
  positiveAmount: {
    color: '#007aff', // Green for positive (income > expense)
  },
  negativeAmount: {
    color: '#E74C3C', // Red for negative (expense > income)
  },
  noDataContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  // Elegant Segmented Control Styles
  segmentedControlWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 3,
    overflow: 'hidden',
  },
  segment: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  segmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeSegment: {
    backgroundColor: '#555555',
  },
  segmentText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  amountText: {
    fontSize: 13,
    marginLeft: 4,
    fontWeight: '500',
  },
  activeSegmentText: {
    color: 'white',
    fontWeight: '600',
  },
  expenseAmountText: {
    color: '#E74C3C',
  },
  incomeAmountText: {
    color: '#007aff',
  },
});

export default ExpenseHistoryChart;